interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
  timestamp: string;
  error?: { details: any } | null;
}

/**
 * Format successful response
 * @param data - Data to return
 * @param message - Success message
 * @param statusCode - HTTP status code
 * @returns Formatted response object
 */
export const responseFormatter = <T>(
  data: T,
  message: string = "Success",
  statusCode: number = 200
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format error response
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param error - Error details
 * @returns Formatted error object
 */
export const errorFormatter = (
  message: string,
  statusCode: number = 500,
  error: any = null
): ApiResponse<null> => {
  return {
    success: false,
    message,
    statusCode,
    data: null,
    error: error ? { details: error } : null,
    timestamp: new Date().toISOString(),
  };
};
