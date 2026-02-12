import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

/**
 * Typed API error thrown by the ApiClient interceptors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Backend standardized response shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

type TokenProvider = () => string | null;
type LogoutCallback = () => void;

let instance: ApiClient | null = null;

/**
 * Singleton HTTP client wrapping Axios.
 * Automatically injects Bearer token and unwraps ApiResponse.
 *
 * Must be initialized with `configureApiClient()` before first use.
 */
export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(
    baseUrl: string,
    private readonly getToken: TokenProvider,
    private readonly onUnauthorized?: LogoutCallback,
  ) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
      timeout: 30_000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request: inject Bearer token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response: unwrap ApiResponse, handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // If the backend wraps in ApiResponse, unwrap it
        if (
          response.data &&
          typeof response.data === "object" &&
          "success" in response.data
        ) {
          if (!response.data.success) {
            throw new ApiError(
              response.data.message || "Request failed",
              response.status,
              response.data,
            );
          }
          // Unwrap: put `data` field as the actual response data
          response.data = response.data.data as any;
        }
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        if (error.response) {
          const { status, data } = error.response;

          // Auto-logout on 401
          if (status === 401 && this.onUnauthorized) {
            this.onUnauthorized();
          }

          const message =
            data?.message ||
            error.message ||
            `Request failed with status ${status}`;

          throw new ApiError(message, status, data);
        }

        // Network error / timeout
        throw new ApiError(error.message || "Network error", 0);
      },
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

/**
 * Initialize the singleton ApiClient.
 * Call this once during app startup (e.g., after auth store is ready).
 */
export function configureApiClient(
  baseUrl: string,
  getToken: TokenProvider,
  onUnauthorized?: LogoutCallback,
): ApiClient {
  instance = new ApiClient(baseUrl, getToken, onUnauthorized);
  return instance;
}

/**
 * Get the singleton ApiClient instance.
 * @throws if `configureApiClient()` was not called first.
 */
export function getApiClient(): ApiClient {
  if (!instance) {
    throw new Error(
      "ApiClient not configured. Call configureApiClient() during app initialization.",
    );
  }
  return instance;
}
