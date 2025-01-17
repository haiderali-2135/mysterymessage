import { Message } from "@/model/User";


export interface ApiResponse{
    success: Boolean;
    message: String;
    isAcceptingMessage ?: Boolean;
    messages?:Array<Message>
}