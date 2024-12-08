import { Message } from "@/model/User";


export interface ApiResponse{
    success: Boolean;
    message: String;
    isAcceptingMessages ?: Boolean;
    messages?:Array<Message>
}