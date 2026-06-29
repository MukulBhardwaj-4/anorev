import { db } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
    );

    const result = await db.collection("user").deleteMany({
        emailVerified: false,
        createdAt: { $lt: oneDayAgo },
    });

    return NextResponse.json({
        success: true,
        deletedUsers: result.deletedCount,
    });
}