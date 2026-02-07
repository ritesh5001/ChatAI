/**
 * Socket.io Service
 * 
 * Singleton socket connection for real-time AI messaging.
 * Handles authentication via token in handshake.
 */

import { io, Socket } from 'socket.io-client';
import { config } from '../utils/config';
import { getToken } from './storage.service';
import {
    AIMessagePayload,
    AIResponseChunk,
    AIResponseEnd,
    AIResponseError,
} from '../types';

let socket: Socket | null = null;

export interface SocketCallbacks {
    onResponseStart?: (chatId: string) => void;
    onResponseChunk?: (data: AIResponseChunk) => void;
    onResponseEnd?: (data: AIResponseEnd) => void;
    onResponseError?: (data: AIResponseError) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Initialize socket connection with authentication
 */
export async function initSocket(callbacks: SocketCallbacks): Promise<Socket | null> {
    const token = await getToken();

    if (!token) {
        console.error('[Socket] No token available for connection');
        return null;
    }

    // Disconnect existing socket if any
    if (socket?.connected) {
        socket.disconnect();
    }

    socket = io(config.socketUrl, {
        transports: ['websocket', 'polling'],
        extraHeaders: {
            // For mobile, we pass the token via cookie header format
            cookie: `token=${token}`,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Event listeners
    socket.on('connect', () => {
        if (config.enableDebugLogs) {
            console.log('[Socket] Connected:', socket?.id);
        }
        callbacks.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
        if (config.enableDebugLogs) {
            console.log('[Socket] Disconnected:', reason);
        }
        callbacks.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        callbacks.onError?.(error);
    });

    // AI response events
    socket.on('ai-response-start', (data: { chat: string }) => {
        if (config.enableDebugLogs) {
            console.log('[Socket] AI response started for chat:', data.chat);
        }
        callbacks.onResponseStart?.(data.chat);
    });

    socket.on('ai-response-chunk', (data: AIResponseChunk) => {
        callbacks.onResponseChunk?.(data);
    });

    socket.on('ai-response-end', (data: AIResponseEnd) => {
        if (config.enableDebugLogs) {
            console.log('[Socket] AI response completed');
        }
        callbacks.onResponseEnd?.(data);
    });

    socket.on('ai-response-error', (data: AIResponseError) => {
        console.error('[Socket] AI response error:', data.error);
        callbacks.onResponseError?.(data);
    });

    return socket;
}

/**
 * Send a message to the AI
 */
export function sendMessage(payload: AIMessagePayload): void {
    if (!socket?.connected) {
        console.error('[Socket] Cannot send message - not connected');
        return;
    }

    if (config.enableDebugLogs) {
        console.log('[Socket] Sending message to chat:', payload.chat);
    }

    socket.emit('ai-message', payload);
}

/**
 * Disconnect the socket
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Get current socket connection status
 */
export function isConnected(): boolean {
    return socket?.connected ?? false;
}

/**
 * Get the socket instance (for advanced usage)
 */
export function getSocket(): Socket | null {
    return socket;
}
