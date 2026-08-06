import dbconnect from "@/config/dbconnect";
import { auth } from "@/lib/auth";
import { Room } from "@/models/room.model";
import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export const GET = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "You must be signed in to view rooms");
    }

    const rooms = await Room.find({ creator: session.user.id });

    const response = rooms.map((room) => ({
        id: room._id,
        title: room.description,
        uploadedAt: room.createdAt,
        username: room.username,
        reviewCount: room.reviews.length,
    }));

    return NextResponse.json(new ApiResponse(200, response), { status: 200 });
});

export const POST = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "You must be signed in to create a room");
    }

    const body = await request.json();
    if (!body.description || !body.contentUrl) {
        throw new ApiError(400, "Description and content URL are required");
    }

    const room = await Room.create({
        creator: session.user.id,
        username: session.user.name,
        description: body.description,
        contentUrl: body.contentUrl,
    });

    if (!room) {
        throw new ApiError(500, "Failed to create room");
    }

    return NextResponse.json(new ApiResponse(201, room), { status: 201 });
});

