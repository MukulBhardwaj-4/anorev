import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

export function apiHandler(
    handler: (req: NextRequest, ctx: any) => Promise<NextResponse>
) {
    return async (req: NextRequest, ctx: any) => {
        try {
            return await handler(req, ctx);
        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json(
                    new ApiResponse(error.statusCode, null, error.message),
                    { status: error.statusCode }
                );
            }
            console.error(error);
            return NextResponse.json(
                new ApiResponse(500, null, "Internal Server Error"),
                { status: 500 }
            );
        }
    };
}