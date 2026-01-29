declare const api: import("axios").AxiosInstance;
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    statusCode: number;
    timestamp: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export default api;
