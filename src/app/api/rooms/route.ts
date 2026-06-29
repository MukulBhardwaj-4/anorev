import dbconnect from "@/config/dbconnect";
import { auth } from "@/lib/auth";
import { Room } from "@/models/room.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await dbconnect();

    try {
        const session = await auth.api.getSession({ headers: request.headers })
        const rooms = await Room.find({
            creator: session?.user.id
        })
        if (rooms.length === 0) {
            return NextResponse.json([], { status: 200 })
        }
        const response = rooms.map((room) => ({
            id: room._id,
            title: room.description,
            uploadedAt: room.createdAt,
            username: room.username,
            reviewCount: room.reviews.length,
        }));
        return NextResponse.json(response, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in getting rooms function" }, { status: 405 })
    }
}

export async function POST(request: NextRequest) {
    await dbconnect();

    try {
        const body = await request.json();
        const session = await auth.api.getSession({ headers: request.headers })
        const room = await Room.create({
            creator: session?.user.id,
            username: session?.user.name,
            description: body.description,
            contentUrl: body.contentUrl,
        })
        if (!room) {
            return NextResponse.json({ error: "Error while creating a room" }, { status: 402 })
        }
        return NextResponse.json(room, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in creating room function" }, { status: 405 })
    }
}

