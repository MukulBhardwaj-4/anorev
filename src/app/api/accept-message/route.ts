import dbconnect from "@/config/dbconnect";
import { auth, db } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export const GET = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await db.collection("user").findOne({
        _id: new ObjectId(session.user.id),
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return NextResponse.json(new ApiResponse(200, user.isAcceptingMessages), { status: 200 });
});

export const PATCH = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const body = await request.json();
    if (typeof body.msgStatus !== "boolean") {
        throw new ApiError(400, "msgStatus must be a boolean");
    }

    const user = await db.collection("user").findOneAndUpdate(
        { _id: new ObjectId(session.user.id) },
        { $set: { isAcceptingMessages: body.msgStatus } },
        { returnDocument: "after" }
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return NextResponse.json(new ApiResponse(200, user.isAcceptingMessages), { status: 200 });
});