import { authOptions } from "../auth/[...nextauth]/options";
import { auth } from "../auth/[...nextauth]/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

//const session = await auth(req, res)

export async function POST(request: Request){
    await dbConnect()
    const session = await auth();
    const user: User = session?.user

    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },{status:401}
        )
    }


    const userId = user._id;
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new: true}
        )
        if(!updatedUser){
            return Response.json(
                {
                    success: false,
                    message: "failed to update user status to accept messages"
                },{status:401}
            )
        }

        return Response.json(
            {
                success: true,
                message: "message acceptance status updated successfully"
            },{status:200}
        )

    } catch (error) {
        console.log("failed to update user status to accept messages");
        
        return Response.json(
            {
                success: false,
                message: "failed to update user status to accept messages"
            },{status:500}
        )
    }
}


export async function GET(request: Request){
    const session = await auth();
    const user: User = session?.user

    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },{status:401}
        )
    }


    const userId = user._id;
   try {
    const foundUser = await UserModel.findById(userId)

    if(!foundUser){
        return Response.json(
            {
                success: false,
                message: "user not found"
            },{status:404}
        )
    }

    return Response.json(
        {
            success: true,
            message: "user found",
            isAcceptingMessages: foundUser.isAcceptingMessage
        },{status:200}
    )

   } catch (error) {
    console.log("failed to retrieve user status");
        
    return Response.json(
        {
            success: false,
            message: "error in getting message acceptance status"
        },{status:500}
    )
   }

}
