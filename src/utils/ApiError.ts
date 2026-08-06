export class ApiError extends Error {
    statusCode: number;
    data: null;
    success: boolean;

    constructor(statusCode: number, message = "Something went wrong") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
    }
}