/**
 * OAuth Service
 * 
 * Handles OAuth authentication flow for mobile:
 * 1. Opens OAuth URL in system browser
 * 2. Backend redirects to deep link after authentication
 * 3. App captures deep link and extracts token
 */

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { config } from '../utils/config';

export type OAuthProvider = 'google' | 'github';

export interface OAuthResult {
    success: boolean;
    token?: string;
    user?: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    error?: string;
    cancelled?: boolean;
}

/**
 * Parse the auth callback URL and extract token/user/error
 */
export function parseAuthCallback(url: string): OAuthResult {
    try {
        const parsed = Linking.parse(url);

        // Check for error
        if (parsed.queryParams?.error) {
            return {
                success: false,
                error: decodeURIComponent(parsed.queryParams.error as string),
            };
        }

        // Extract token and user
        const token = parsed.queryParams?.token as string;
        const userJson = parsed.queryParams?.user as string;

        if (!token) {
            return {
                success: false,
                error: 'No token received',
            };
        }

        let user;
        if (userJson) {
            try {
                user = JSON.parse(decodeURIComponent(userJson));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        return {
            success: true,
            token,
            user,
        };
    } catch (error) {
        console.error('Failed to parse auth callback:', error);
        return {
            success: false,
            error: 'Failed to parse authentication response',
        };
    }
}

/**
 * Start OAuth flow by opening the auth URL in system browser
 */
export async function startOAuthFlow(provider: OAuthProvider): Promise<OAuthResult> {
    try {
        // Construct OAuth URL with platform=mobile parameter
        const authUrl = `${config.apiUrl}/api/auth/${provider}?platform=mobile`;

        if (config.enableDebugLogs) {
            console.log(`[OAuth] Starting ${provider} flow:`, authUrl);
        }

        // Open in system browser - the browser will redirect to our deep link
        const result = await WebBrowser.openAuthSessionAsync(
            authUrl,
            'jarvisai://auth', // This is our redirect URI scheme
            {
                showInRecents: true,
                preferEphemeralSession: true, // Don't persist session cookies
            }
        );

        if (config.enableDebugLogs) {
            console.log('[OAuth] Browser result:', result);
        }

        // Handle different result types
        if (result.type === 'cancel') {
            return {
                success: false,
                cancelled: true,
                error: 'Authentication cancelled',
            };
        }

        if (result.type === 'dismiss') {
            return {
                success: false,
                cancelled: true,
                error: 'Authentication dismissed',
            };
        }

        if (result.type === 'success' && result.url) {
            return parseAuthCallback(result.url);
        }

        return {
            success: false,
            error: 'Unknown authentication result',
        };
    } catch (error: any) {
        console.error('[OAuth] Error:', error);
        return {
            success: false,
            error: error.message || 'Authentication failed',
        };
    }
}

/**
 * Warm up the browser for faster OAuth launch (optional optimization)
 */
export async function warmUpBrowser(): Promise<void> {
    try {
        await WebBrowser.warmUpAsync();
    } catch (e) {
        // Silently fail - not critical
    }
}

/**
 * Cool down the browser after OAuth (cleanup)
 */
export async function coolDownBrowser(): Promise<void> {
    try {
        await WebBrowser.coolDownAsync();
    } catch (e) {
        // Silently fail - not critical
    }
}
