/**
 * Environment Configuration
 * 
 * Uses Expo constants for environment-specific values.
 * In production, these would come from app.config.js or EAS secrets.
 */

import Constants from 'expo-constants';

// Determine environment
const isDev = __DEV__;

// API Base URLs
const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = 'https://chatai-vlcv.onrender.com';

export const config = {
    // API Configuration
    apiUrl: isDev ? DEV_API_URL : PROD_API_URL,

    // Socket.io Configuration
    socketUrl: isDev ? DEV_API_URL : PROD_API_URL,

    // Request timeouts (ms)
    requestTimeout: 30000,

    // App Info
    appName: Constants.expoConfig?.name || 'Jarvis AI',
    appVersion: Constants.expoConfig?.version || '1.0.0',

    // Feature flags
    enableDebugLogs: isDev,
} as const;

export type Config = typeof config;
