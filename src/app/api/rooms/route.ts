import dbconnect from "@/config/dbconnect";
import { auth } from "@/lib/auth";
import { Room } from "@/models/room.model";
import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/utils/ApiHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const GET = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "You must be signed in to view rooms");
    }

    const rooms = await Room.find({ creator: session.user.id });

    const response = rooms.map((room) => ({
        id: room._id,
        title: room.description,
        uploadedAt: room.createdAt,
        username: room.username,
        reviewCount: room.reviews.length,
        contentUrl: room.contentUrl,
        imageUrl: room.imageUrl,
        imagePublicId: room.imagePublicId,
        videoUrl: room.videoUrl,
        videoPublicId: room.videoPublicId,
    }));

    return NextResponse.json(new ApiResponse(200, response), { status: 200 });
});

export const POST = apiHandler(async (request: NextRequest) => {
    await dbconnect();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        throw new ApiError(401, "You must be signed in to create a room");
    }

    const body = await request.json();
    if (!body.description) {
        throw new ApiError(400, "Description is required");
    }

    let imageUrl: string | undefined = undefined;
    let imagePublicId: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;
    let videoPublicId: string | undefined = undefined;

    if (body.image) {
        try {
            const uploadRes = await cloudinary.uploader.upload(body.image, {
                folder: "anorev/images",
                resource_type: "image",
            });
            imageUrl = uploadRes.secure_url;
            imagePublicId = uploadRes.public_id;
        } catch (error: any) {
            throw new ApiError(400, `Failed to upload image: ${error.message}`);
        }
    }

    if (body.video) {
        try {
            const uploadRes = await cloudinary.uploader.upload(body.video, {
                folder: "anorev/videos",
                resource_type: "video",
            });
            videoUrl = uploadRes.secure_url;
            videoPublicId = uploadRes.public_id;
        } catch (error: any) {
            throw new ApiError(400, `Failed to upload video: ${error.message}`);
        }
    }

    const room = await Room.create({
        creator: session.user.id,
        username: session.user.name,
        description: body.description,
        contentUrl: body.contentUrl || undefined,
        imageUrl,
        imagePublicId,
        videoUrl,
        videoPublicId,
    });

    if (!room) {
        throw new ApiError(500, "Failed to create room");
    }

    return NextResponse.json(new ApiResponse(201, room), { status: 201 });
});

