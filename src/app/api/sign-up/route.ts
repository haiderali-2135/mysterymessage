import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){

    await dbConnect()

    try {

        const {username, email, password} =  await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true})
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message:"this username is already taken"
            }, {status: 400})
        }


        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        const existingUserVerifiedByEmail = await UserModel.findOne({email})
        if(existingUserVerifiedByEmail){
            if (existingUserVerifiedByEmail.isVerified) {
                Response.json({
                    success: false,
                    message: "This email is already registered"
                }, {status : 400})
            }else{
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1)

                await existingUserVerifiedByEmail.save()
            }
        }else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        // Send Verification Email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        
        if(!emailResponse.success){
            Response.json({
                success: false,
                message: emailResponse.message 
            }, {status : 500})
        }

        Response.json({
            success: true,
            message: "Please verify your email" 
        }, {status : 201})


    } catch (error) {
        console.error('Error regestering user');
        return Response.json(
            {
                success: false,
                message: "Error Regestering user"
            }, { status: 500}
        )
        
    }
}