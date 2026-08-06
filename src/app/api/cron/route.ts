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

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await db.collection("user").find({
        emailVerified: false,
        createdAt: { $lt: oneDayAgo },
    }).project({ _id: 1, email: 1 }).toArray();

    if (users.length === 0) {
        return NextResponse.json(new ApiResponse(200, { deletedUsers: 0 }), { status: 200 });
    }

    const userIds = users.map(u => u._id);
    const emails = users.map(u => u.email);

    await db.collection("session").deleteMany({ userId: { $in: userIds } });
    await db.collection("account").deleteMany({ userId: { $in: userIds } });
    await db.collection("verification").deleteMany({ identifier: { $in: emails } });
    const result = await db.collection("user").deleteMany({ _id: { $in: userIds } });

    return NextResponse.json(new ApiResponse(200, { deletedUsers: result.deletedCount }), { status: 200 });
});