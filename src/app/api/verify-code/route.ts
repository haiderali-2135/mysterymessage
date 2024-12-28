import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { verifySchema } from "@/Schemas/verifySchema";

// Perform zod verficiation

const userVerifyCodeSchema = z.object({
    code: verifySchema
})

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()


        const VerificationCode = {
            code: code.toString()
        }
        const result = verifySchema.safeParse(VerificationCode)
        if(!result.success){            
            return Response.json({
                success: false,
                message: "invalid code"
            },{status : 400})
        }
        console.log("result data: ",result.data);
        
        

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})


        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "user not found"
                },{status:500})
        }


        const isCodeValid= user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date() 

        if(isCodeValid && isCodeNotExpired){
            user.isVerified= true
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: "account verified successfully"
                },{status:200})
        } else if(!isCodeNotExpired){

            if(!isCodeValid){
                return Response.json(
                    {
                        success: false,
                        message: "your verification code is incorrect and has expired, please signup again"
                    },{status:400})
            }
            return Response.json(
                {
                    success: false,
                    message: "your verification code has expired, please signup again"
                },{status:400})
        }else{
            return Response.json(
                {
                    success: false,
                    message: "incorrect verification code"
                },{status:200})
        }



    } catch (error) {
        console.error('Error verifying user', error);
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },{status:500}
        )
    }



}