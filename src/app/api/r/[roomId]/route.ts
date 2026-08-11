import dbconnect from "@/config/dbconnect";
import { Review } from "@/models/review.model";
import { Room } from "@/models/room.model";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { db } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { pusherServer } from "@/lib/pusher";

export function getIpHash(request: NextRequest) {
    const ip = ipAddress(request) ?? "unknown";
    return createHash("sha256").update(ip).digest("hex");
}

export const GET = apiHandler(async (request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) => {
    await dbconnect();
    const { roomId } = await params;

    if (!roomId) {
        throw new ApiError(400, "Room id is required");
    }

    const room = await Room.findById(roomId).select("username description contentUrl creator");
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    let isAcceptingMessages = false;
    try {
        const creator = await db.collection("user").findOne({ _id: new ObjectId(room.creator) });
        isAcceptingMessages = !!creator?.isAcceptingMessages;
    } catch (error) {
        console.error("Error fetching creator accept-message status", error);
    }

    const ipHash = getIpHash(request);
    const existingReview = await Review.findOne({ roomId, ipHash });

    return NextResponse.json(
        new ApiResponse(200, {
            ...room.toObject(),
            hasReviewed: !!existingReview,
            isAcceptingMessages,
        }),
        { status: 200 }
    );
});

export const POST = apiHandler(async (request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) => {
    await dbconnect();
    const body = await request.json();
    const { roomId } = await params;

    if (!roomId) {
        throw new ApiError(400, "Room id is required");
    }
    if (!body.textReview || typeof body.textReview !== "string" || !body.textReview.trim()) {
        throw new ApiError(400, "Review text is required");
    }

    if (body.textReview.length > 500) {
        throw new ApiError(400, "Review text must be at most 500 characters");
    }

    const ipHash = getIpHash(request);
    let review;
    try {
        review = await Review.create({
            textReview: body.textReview.trim(),
            roomId,
            ipHash,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            throw new ApiError(409, "You have already reviewed this room");
        }
        throw error;
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, { $push: { reviews: review._id } });
    if (!updatedRoom) {
        throw new ApiError(404, "Room not found");
    }

    await pusherServer.trigger(`private-${updatedRoom.username}`, "new-review", {
        review,
    });

    return NextResponse.json(new ApiResponse(201, review), { status: 201 });
});
