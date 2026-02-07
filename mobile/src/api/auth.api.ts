/**
 * Authentication API Service
 * 
 * All auth-related API calls.
 */

import apiClient from './client';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ProfileResponse,
    ProfileUpdateRequest,
} from '../types';

export const authApi = {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
        return response.data;
    },

    /**
     * Login with email and password
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
        return response.data;
    },

    /**
     * Logout the current user
     */
    async logout(): Promise<void> {
        await apiClient.post('/api/auth/logout');
    },

    /**
     * Get current user profile
     */
    async getProfile(): Promise<ProfileResponse> {
        const response = await apiClient.get<ProfileResponse>('/api/auth/profile');
        return response.data;
    },

    /**
     * Update user profile
     */
    async updateProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
        const response = await apiClient.put<ProfileResponse>('/api/auth/profile', data);
        return response.data;
    },
};
