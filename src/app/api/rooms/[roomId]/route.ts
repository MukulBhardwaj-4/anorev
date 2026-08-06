import dbconnect from "@/config/dbconnect";
import { Room } from "@/models/room.model";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/models/review.model";
import "@/models/review.model";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export const GET = apiHandler(async (request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) => {
    await dbconnect();
    const { roomId } = await params;

    if (!roomId) {
        throw new ApiError(400, "Room id is required");
    }

    const room = await Room.findById(roomId).populate("reviews");
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || room.creator.toString() !== session.user.id) {
        throw new ApiError(401, "Unauthorized");
    }

    return NextResponse.json(new ApiResponse(200, room), { status: 200 });
});

export const DELETE = apiHandler(async (request: NextRequest, { params }: {
    params: Promise<{ roomId: string }>
}) => {
    await dbconnect();
    const { roomId } = await params;

    if (!roomId) {
        throw new ApiError(400, "Room id is required");
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || room.creator.toString() !== session.user.id) {
        throw new ApiError(401, "Unauthorized");
    }

    await Room.findByIdAndDelete(roomId);
    await Review.deleteMany({ roomId });

    return NextResponse.json(new ApiResponse(200, null), { status: 200 });
});