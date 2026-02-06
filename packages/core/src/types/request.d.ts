import type { HttpMethod } from '@vessel/network';
/**
 * Key-value pair for headers, query params, etc.
 */
export interface KeyValuePair {
    id: string;
    key: string;
    value: string;
    enabled: boolean;
    description?: string;
}
/**
 * Request body configuration.
 */
export interface RequestBody {
    type: 'none' | 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'binary';
    content: string;
    formData?: KeyValuePair[];
}
/**
 * Authentication configuration.
 */
export interface AuthConfig {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyLocation?: 'header' | 'query';
}
/**
 * A single API request definition.
 */
export interface ApiRequest {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    body: RequestBody;
    auth: AuthConfig;
    createdAt: number;
    updatedAt: number;
}
/**
 * A folder in a collection.
 */
export interface CollectionFolder {
    id: string;
    name: string;
    requests: ApiRequest[];
    folders: CollectionFolder[];
}
/**
 * A collection of API requests.
 */
export interface Collection {
    id: string;
    name: string;
    description?: string;
    version: string;
    requests: ApiRequest[];
    folders: CollectionFolder[];
    variables: KeyValuePair[];
    createdAt: number;
    updatedAt: number;
}
/**
 * Response from an executed request.
 */
export interface ApiResponse {
    requestId: string;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    timing: {
        dns?: number;
        connect?: number;
        tls?: number;
        firstByte: number;
        total: number;
    };
    size: {
        headers: number;
        body: number;
    };
    timestamp: number;
}
/**
 * History entry for executed requests.
 */
export interface HistoryEntry {
    id: string;
    request: ApiRequest;
    response: ApiResponse;
    timestamp: number;
}
//# sourceMappingURL=request.d.ts.map