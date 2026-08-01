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

    const users = await db.collection("user").find({
        emailVerified: false,
        createdAt: { $lt: oneDayAgo },
    }).project({ _id: 1, email: 1 }).toArray();

    if (users.length === 0) {
        return NextResponse.json({
            success: true,
            deletedUsers: 0,
            deletedSessions: 0,
            deletedAccounts: 0,
            deletedVerifications: 0,
        });
    }

    const userIds = users.map(u => u._id);
    const emails = users.map(u => u.email);

    await db.collection("session").deleteMany({ userId: { $in: userIds } });
    await db.collection("account").deleteMany({ userId: { $in: userIds } });
    await db.collection("verification").deleteMany({ identifier: { $in: emails } });
    const result = await db.collection("user").deleteMany({ _id: { $in: userIds } });

    return NextResponse.json({ success: true, deletedUsers: result.deletedCount });
}