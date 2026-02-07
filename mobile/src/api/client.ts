/**
 * Axios API Client
 * 
 * Centralized HTTP client with:
 * - Automatic token injection via interceptors
 * - Standardized error handling
 * - Request/response logging in dev
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '../utils/config';
import { getToken, removeToken } from '../services/storage.service';
import { APIError } from '../types';

// Create axios instance with base config
const apiClient: AxiosInstance = axios.create({
    baseURL: config.apiUrl,
    timeout: config.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
    async (request: InternalAxiosRequestConfig) => {
        const token = await getToken();

        if (token && request.headers) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        if (config.enableDebugLogs) {
            console.log(`[API] ${request.method?.toUpperCase()} ${request.url}`);
        }

        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        if (config.enableDebugLogs) {
            console.log(`[API] Response ${response.status} from ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError<APIError>) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (config.enableDebugLogs) {
            console.error(`[API] Error ${status}: ${message}`);
        }

        // Handle 401 Unauthorized - clear token and trigger re-auth
        if (status === 401) {
            await removeToken();
            // The auth context will handle navigation to login
        }

        return Promise.reject(error);
    }
);

export default apiClient;
