import dbconnect from "@/config/dbconnect";
import { auth, db } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
    await dbconnect();

    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const user = await db.collection("user").findOne({
            _id: new ObjectId(session?.user.id)
        })
        if (!user) {
            return NextResponse.json({ error: "Error while fetching switch status" }, { status: 402 })
        }
        return NextResponse.json(user.isAcceptingMessages, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error in getting message status" }, { status: 405 })
    }
}

export async function PATCH(request: NextRequest) {
    await dbconnect();
    try {
        const body = await request.json()
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const user = await db.collection("user").findOneAndUpdate(
            { _id: new ObjectId(session?.user.id) },
            {
                $set: {
                    isAcceptingMessages: body.msgStatus,
                },
            },
        )
        if (!user) {
            return NextResponse.json({ error: "Error while fetching switch status" }, { status: 402 })
        }
        return NextResponse.json(user.isAcceptingMessages, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error in changing status messages" }, { status: 405 })
    }
}
