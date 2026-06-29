import mongoose, { Document } from "mongoose";

export interface IReview extends Document{
    textReview: string,
    roomId: mongoose.Types.ObjectId
    ipHash: string,
}

const reviewSchema = new mongoose.Schema<IReview>({
    textReview: {
        type: String,
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    ipHash: {
        type: String,
        required: true,
    }
}, { timestamps: true })

reviewSchema.index({ roomId: 1, ipHash: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema)