import dbconnect from "@/config/dbconnect";
import { db } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export const POST = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const body = await request.json();
    const username = body?.username;

    if (!username || typeof username !== "string" || !username.trim()) {
        throw new ApiError(400, "Username is required");
    }

    const existingUser = await db.collection("user").findOne({
        name: username,
        emailVerified: true,
    });

    if (existingUser) {
        throw new ApiError(409, "Username already exists");
    }

    return NextResponse.json(new ApiResponse(200, { available: true }), { status: 200 });
});