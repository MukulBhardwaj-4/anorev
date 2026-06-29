import dbconnect from "@/config/dbconnect";
import { db } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    await dbconnect();
    try {
        const body = await request.json()
        const username = body?.username;
        const existingUser = await db.collection("user").findOne({name: username, emailVerified: true})
        if(existingUser){
            return NextResponse.json("Username already exist", { status: 400 })
        }
        return NextResponse.json("Username already exists", { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error in getting uniqueness of username" }, { status: 500 })
    }
}