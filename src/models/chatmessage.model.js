import { Schema, mongoose } from "mongoose";

const chatMessageSchema = new Schema(
    {
        user_name: { type: String, required: true },
        message: { type: String, required: true },
    }
);

const ChatMessage = mongoose.model("chatMessage", chatMessageSchema);
export { ChatMessage };