import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbconnect from "@/config/dbconnect";
import { Room } from "@/models/room.model";

export const POST = apiHandler(async (request: NextRequest) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const formData = await request.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    if (!socketId || !channelName) {
        throw new ApiError(400, "socket_id and channel_name are required");
    }

    const roomId = channelName.startsWith("private-")
        ? channelName.slice("private-".length)
        : "";
    if (!ObjectId.isValid(roomId)) {
        throw new ApiError(403, "Invalid channel");
    }

    await dbconnect();
    const room = await Room.findById(roomId).select("_id creator");
    if (!room) {
        throw new ApiError(404, "Room not found");
    }
    if (room.creator.toString() !== session.user.id) {
        throw new ApiError(403, "Only the room creator can subscribe");
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse, { status: 200 });
});