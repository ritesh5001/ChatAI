/**
 * Chat API Service
 * 
 * All chat-related API calls.
 */

import apiClient from './client';
import {
    Chat,
    ChatsResponse,
    ChatResponse,
    MessagesResponse,
    CreateChatRequest,
    RenameChatRequest,
} from '../types';

export const chatApi = {
    /**
     * Get all chats for the current user
     */
    async getChats(): Promise<Chat[]> {
        const response = await apiClient.get<ChatsResponse>('/api/chat');
        return response.data.chats;
    },

    /**
     * Create a new chat
     */
    async createChat(data: CreateChatRequest): Promise<Chat> {
        const response = await apiClient.post<ChatResponse>('/api/chat', data);
        return response.data.chat;
    },

    /**
     * Rename a chat
     */
    async renameChat(chatId: string, data: RenameChatRequest): Promise<Chat> {
        const response = await apiClient.put<ChatResponse>(`/api/chat/${chatId}`, data);
        return response.data.chat;
    },

    /**
     * Delete a chat
     */
    async deleteChat(chatId: string): Promise<void> {
        await apiClient.delete(`/api/chat/${chatId}`);
    },

    /**
     * Get messages for a chat
     */
    async getMessages(chatId: string): Promise<MessagesResponse> {
        const response = await apiClient.get<MessagesResponse>(`/api/chat/messages/${chatId}`);
        return response.data;
    },
};
