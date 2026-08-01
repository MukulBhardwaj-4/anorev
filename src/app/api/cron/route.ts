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

    const totalUsers = await db.collection("user").countDocuments({});
    const unverifiedTotal = await db.collection("user").countDocuments({ emailVerified: false });
    const dbName = db.databaseName;

    const users = await db.collection("user").find({
        emailVerified: false,
        createdAt: { $lt: oneDayAgo },
    }).project({ _id: 1, email: 1 }).toArray();

    return NextResponse.json({
        debug: {
            dbName,
            totalUsers,
            unverifiedTotal,
            oneDayAgoUsed: oneDayAgo,
            matchedCount: users.length,
        }
    });
}