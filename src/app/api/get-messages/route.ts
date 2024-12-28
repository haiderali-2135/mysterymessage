import { authOptions } from "../auth/[...nextauth]/options";
import { auth } from "../auth/[...nextauth]/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request: Request){
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


    const userId = new mongoose.Types.ObjectId(user._id); //user id was converted into string in the options.ts so need to convert it back into objectid for mongo aggregation pipeline
    
    //mongoDB aggregation
    try {
        const user = await UserModel.aggregate([
            {$match: {id: userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt': -1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}}
        ])

        if(!user ||  user.length === 0){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },{status:401}
            )
        }

        return Response.json(
            {
                success: true,
                message: "messages found",
                messages: user[0].messages
            },{status:200}
        )
        
    } catch (error) {
        console.log("error sending messages");
        
        return Response.json(
            {
                success: false,
                message: "failed to Get Messages"
            },{status:500}
        )
    }


}