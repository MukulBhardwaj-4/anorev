import dbconnect from "@/config/dbconnect";
import { Review } from "@/models/review.model";
import { Room } from "@/models/room.model";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { db } from "@/lib/auth";
import { ObjectId } from "mongodb";

export function getIpHash(request: NextRequest) {
    const ip = ipAddress(request) ?? "unknown";
    return createHash("sha256").update(ip).digest("hex");
}

export async function GET(request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) {
    await dbconnect();
    try {
        const { roomId } = await params;
        if (!roomId) {
            return NextResponse.json({ error: "roomId not valid" }, { status: 404 })
        }
        const room = await Room.findById(roomId).select("username description contentUrl creator");
        if (!room) {
            return NextResponse.json({ message: "Room not found" }, { status: 200 })
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

        return NextResponse.json({ ...room.toObject(), hasReviewed: !!existingReview, isAcceptingMessages }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in getting specific room function" }, { status: 500 })
    }
}


export async function POST(request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) {
    await dbconnect();

    try {
        const body = await request.json();
        const { roomId } = await params;
        if (!body.textReview) {
            return NextResponse.json({ error: "All inputs are needed" }, { status: 402 })
        }

        if (!roomId) {
            return NextResponse.json({ error: "Room Id is invalid" }, { status: 402 })
        }
        const ipHash = getIpHash(request);
        const review = await Review.create({
            textReview: body.textReview,
            roomId: roomId,
            ipHash
        })
        if (!review) {
            return NextResponse.json({ error: "Error while creating review" }, { status: 402 })
        }
        const updatedRoom = await Room.findByIdAndUpdate(roomId, { $push: { reviews: review._id } })

        if (!updatedRoom) {
            return NextResponse.json({ error: "Error while adding review to room review" }, { status: 402 })
        }

        return NextResponse.json(review, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in creating review function" }, { status: 500 })
    }
}