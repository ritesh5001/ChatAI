/**
 * TypeScript types matching backend API responses
 */

// User types
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    googleId?: string | null;
    githubId?: string | null;
    createdAt: string;
}

export interface UserWithFullName {
    _id: string;
    email: string;
    fullName: {
        firstName: string;
        lastName: string;
    };
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: {
        firstName: string;
        lastName?: string;
    };
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;  // Added for mobile
    user: UserWithFullName;
}

export interface ProfileResponse {
    user: User;
}

export interface ProfileUpdateRequest {
    firstName: string;
    lastName?: string;
}

// Chat types
export interface Chat {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'model';
    chatId: string;
    userId: string;
    createdAt: string;
}

export interface CreateChatRequest {
    title: string;
}

export interface RenameChatRequest {
    title: string;
}

export interface ChatsResponse {
    chats: Chat[];
}

export interface MessagesResponse {
    messages: Message[];
}

export interface ChatResponse {
    message: string;
    chat: Chat;
}

// Socket.io types
export interface AIMessagePayload {
    chat: string;
    content: string;
}

export interface AIResponseChunk {
    content: string;
    chat: string;
}

export interface AIResponseEnd {
    content: string;
    chat: string;
}

export interface AIResponseError {
    error: string;
    chat: string;
}

// API Error
export interface APIError {
    message: string;
    error?: string;
}
