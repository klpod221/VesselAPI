/**
 * Standardized API response wrapper.
 * All endpoints return this shape for consistency.
 */
export class ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;

  private constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  /** Create a success response with data. */
  static ok<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  /** Create an error response with a message. */
  static error(message: string): ApiResponse<never> {
    return new ApiResponse<never>(false, undefined, message);
  }
}
