// export class ApiError extends Error {
//     public status: number;

//     constructor(message: string, status: number) {
//         super(message);
//         this.status = status;
//         Object.setPrototypeOf(this, ApiError.prototype);
//     }
// }
export class ApiError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}