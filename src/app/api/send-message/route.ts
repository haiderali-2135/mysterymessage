
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { Message } from "@/model/User";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json();

    try {
       const user =  await UserModel.findOne({username});
       if (!user) {
        return Response.json(
            {
                success: false,
                message: "user not found"
            },{status:404}
        )
       }

       //is user accepting the messages?

       if (!user.isAcceptingMessage) {
        return Response.json(
            {
                success: false,
                message: "user is not accepting messages"
            },{status:403}
        )
       }

       const newMessage = {content, createdAt: new Date()}

       await user.messages.push(newMessage as Message)

       await user.save()

       return Response.json(
        {
            success: true,
            message: "message sent successfully"
        },{status:200}
    )

       
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "failed to send Messages"
            },{status:500}
        )
    }
}