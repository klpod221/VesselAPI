import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApiRequest, ApiResponse } from '../types/request';
import type { NetworkClient, RequestConfig } from '@vessel/network';

interface RequestState {
  // Current request being edited
  activeRequest: ApiRequest | null;
  
  // Last response received
  lastResponse: ApiResponse | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error message
  error: string | null;
  
  // Network client instance
  networkClient: NetworkClient | null;
}

interface RequestActions {
  // Set the network client
  setClient: (client: NetworkClient) => void;
  
  // Create a new empty request
  newRequest: () => void;
  
  // Update current request
  updateRequest: (updates: Partial<ApiRequest>) => void;
  
  // Execute the current request
  executeRequest: () => Promise<void>;
  
  // Clear the response
  clearResponse: () => void;
  
  // Set active request
  setActiveRequest: (request: ApiRequest | null) => void;
}

type RequestStore = RequestState & RequestActions;

const createEmptyRequest = (): ApiRequest => ({
  id: crypto.randomUUID(),
  name: 'New Request',
  method: 'GET',
  url: '',
  headers: [],
  queryParams: [],
  body: { type: 'none', content: '' },
  auth: { type: 'none' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const buildHeaders = (request: ApiRequest): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  // Add enabled headers
  request.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[h.key] = h.value;
    });
  
  // Add auth headers
  if (request.auth.type === 'bearer' && request.auth.token) {
    headers['Authorization'] = `Bearer ${request.auth.token}`;
  } else if (request.auth.type === 'basic' && request.auth.username) {
    const credentials = btoa(`${request.auth.username}:${request.auth.password || ''}`);
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (request.auth.type === 'api-key' && request.auth.apiKeyLocation === 'header') {
    headers[request.auth.apiKeyName || 'X-API-Key'] = request.auth.apiKeyValue || '';
  }

  return headers;
};

const buildUrl = (request: ApiRequest): string => {
  let url = request.url;
  const enabledParams = request.queryParams.filter((p) => p.enabled && p.key);
  
  if (enabledParams.length > 0) {
    const searchParams = new URLSearchParams();
    enabledParams.forEach((p) => searchParams.append(p.key, p.value));
    url += (url.includes('?') ? '&' : '?') + searchParams.toString();
  }
  
  if (request.auth.type === 'api-key' && request.auth.apiKeyLocation === 'query') {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}${request.auth.apiKeyName || 'api_key'}=${request.auth.apiKeyValue || ''}`;
  }
  
  return url;
};

const buildBody = (request: ApiRequest, headers: Record<string, string>): string | undefined => {
  if (request.body.type === 'json' || request.body.type === 'text') {
    if (request.body.type === 'json' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    return request.body.content;
  }
  
  if (request.body.type === 'x-www-form-urlencoded' && request.body.formData) {
    const formParams = new URLSearchParams();
    request.body.formData
      .filter((f) => f.enabled && f.key)
      .forEach((f) => formParams.append(f.key, f.value));
      
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return formParams.toString();
  }
  
  return undefined;
};

const buildRequestConfig = (request: ApiRequest): RequestConfig => {
  const headers = buildHeaders(request);
  const url = buildUrl(request);
  const body = buildBody(request, headers);
  
  return {
    url,
    method: request.method,
    headers,
    body,
    timeout: 30000,
    followRedirects: true,
  };
};

export const useRequestStore = create<RequestStore>()(
  persist(
    (set, get) => ({
      // State
      activeRequest: null,
      lastResponse: null,
      isLoading: false,
      error: null,
      networkClient: null,
      
      // Actions
      setClient: (client) => set({ networkClient: client }),
      
      newRequest: () => set({ activeRequest: createEmptyRequest(), lastResponse: null, error: null }),
      
      updateRequest: (updates) =>
        set((state) => ({
          activeRequest: state.activeRequest
            ? { ...state.activeRequest, ...updates, updatedAt: Date.now() }
            : null,
        })),
      
      setActiveRequest: (request) => set({ activeRequest: request, lastResponse: null, error: null }),
      
      clearResponse: () => set({ lastResponse: null, error: null }),
      
      executeRequest: async () => {
        const { activeRequest, networkClient } = get();
        
        if (!activeRequest) {
          set({ error: 'No active request' });
          return;
        }
        
        if (!networkClient) {
          set({ error: 'Network client not initialized' });
          return;
        }
        
        if (!activeRequest.url) {
          set({ error: 'URL is required' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const config = buildRequestConfig(activeRequest);
          const result = await networkClient.execute(config);
          
          if (result.ok) {
            set({
              lastResponse: {
                requestId: activeRequest.id,
                status: result.response.status,
                statusText: result.response.statusText,
                headers: result.response.headers,
                body: result.response.body,
                timing: result.response.timing,
                size: result.response.size,
                timestamp: Date.now(),
              },
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message,
              isLoading: false,
            });
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Unknown error',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'vessel-request',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeRequest: state.activeRequest,
      }),
    }
  )
);
