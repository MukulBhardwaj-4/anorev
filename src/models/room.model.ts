import mongoose, { Document } from "mongoose";

export interface IRoom extends Document{
    creator: string,
    username: string,
    contentUrl: string,
    description: string,
    reviews: mongoose.Types.ObjectId[];
}

const roomSchema = new mongoose.Schema<IRoom>({
    creator: {
        type: String,
        ref: "user",
        required: true
    },
    username: {
        type: String,
        required: true
    },
    contentUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
},{timestamps: true})

export const Room = mongoose.models.Room || mongoose.model("Room", roomSchema)