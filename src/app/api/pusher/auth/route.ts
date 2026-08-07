import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { NextRequest, NextResponse } from "next/server";

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

    const expectedChannel = `private-${session.user.name}`;
    if (channelName !== expectedChannel) {
        throw new ApiError(403, "You are not allowed to subscribe to this channel");
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse, { status: 200 });
});