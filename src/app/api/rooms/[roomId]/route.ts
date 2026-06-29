import dbconnect from "@/config/dbconnect";
import { Room } from "@/models/room.model";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/models/review.model";
import "@/models/review.model";

export async function GET(request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) {
    await dbconnect();
    try {
        const { roomId } = await params;
        if (!roomId) {
            return NextResponse.json({ error: "roomId not valid" }, { status: 404 })
        }
        const room = await Room.findById(roomId).populate("reviews");

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session || room.creator.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(room, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in getting specific room function" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) {
    await dbconnect();

    try {
        const { roomId } = await params;
        if (!roomId) {
            return NextResponse.json({ error: "roomId not valid" }, { status: 404 })
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session || room.creator.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        await Room.findByIdAndDelete(roomId)
        await Review.deleteMany({ roomId })
        return NextResponse.json({ message: "Room deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in deleting room function" }, { status: 500 })
    }
}