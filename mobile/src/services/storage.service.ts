/**
 * Secure Storage Service
 * 
 * Uses expo-secure-store for encrypted token storage on iOS/Android.
 * Falls back to in-memory storage for web (not recommended for production web).
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'jarvis_auth_token';
const USER_KEY = 'jarvis_user_data';

// In-memory fallback for web (SecureStore not available)
const memoryStorage: Record<string, string> = {};

/**
 * Store a value securely
 */
async function setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
        memoryStorage[key] = value;
        return;
    }
    await SecureStore.setItemAsync(key, value);
}

/**
 * Retrieve a value from secure storage
 */
async function getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
        return memoryStorage[key] || null;
    }
    return await SecureStore.getItemAsync(key);
}

/**
 * Delete a value from secure storage
 */
async function deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
        delete memoryStorage[key];
        return;
    }
    await SecureStore.deleteItemAsync(key);
}

// Token-specific helpers
export async function setToken(token: string): Promise<void> {
    await setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
    return await getItem(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
    await deleteItem(TOKEN_KEY);
}

// User data helpers
export async function setUserData(user: object): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
}

export async function getUserData<T>(): Promise<T | null> {
    const data = await getItem(USER_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as T;
    } catch {
        return null;
    }
}

export async function removeUserData(): Promise<void> {
    await deleteItem(USER_KEY);
}

// Clear all auth data
export async function clearAuthData(): Promise<void> {
    await Promise.all([removeToken(), removeUserData()]);
}

export const storage = {
    setItem,
    getItem,
    deleteItem,
    setToken,
    getToken,
    removeToken,
    setUserData,
    getUserData,
    removeUserData,
    clearAuthData,
};
