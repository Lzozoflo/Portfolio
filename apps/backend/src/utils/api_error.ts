export class ApiError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}