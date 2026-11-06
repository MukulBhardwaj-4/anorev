import { db } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export const GET = apiHandler(async (req: NextRequest) => {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        throw new ApiError(401, "Unauthorized");
    }

    const now = new Date();

    // Delete expired sessions from all users
    const expiredSessions = await db.collection("session").deleteMany({
        expiresAt: { $lt: now }
    });

    return NextResponse.json(new ApiResponse(200, {
        deletedSessions: expiredSessions.deletedCount
    }), { status: 200 });
});