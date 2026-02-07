/**
 * Authentication Context
 * 
 * Provides global auth state and methods for the entire app.
 * Handles token persistence, auto-login, and session management.
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { authApi } from '../api/auth.api';
import {
    setToken,
    getToken,
    clearAuthData,
    setUserData,
} from '../services/storage.service';
import {
    startOAuthFlow,
    OAuthProvider,
    OAuthResult,
} from '../services/oauth.service';
import {
    User,
    UserWithFullName,
    LoginRequest,
    RegisterRequest,
} from '../types';

// Convert API user format to internal user format
function normalizeUser(user: UserWithFullName | User): User {
    if ('fullName' in user) {
        return {
            _id: user._id,
            email: user.email,
            firstName: user.fullName.firstName,
            lastName: user.fullName.lastName || '',
            createdAt: new Date().toISOString(),
        };
    }
    return user;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    loginWithOAuth: (provider: OAuthProvider) => Promise<OAuthResult>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await getToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            // Verify token by fetching profile
            const { user: profileUser } = await authApi.getProfile();
            setUser(profileUser);
        } catch (error) {
            // Token invalid or expired
            await clearAuthData();
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (data: LoginRequest) => {
        const response = await authApi.login(data);

        // Store token and user
        await setToken(response.token);
        const normalizedUser = normalizeUser(response.user);
        await setUserData(normalizedUser);
        setUser(normalizedUser);
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        const response = await authApi.register(data);

        // Store token and user
        await setToken(response.token);
        const normalizedUser = normalizeUser(response.user);
        await setUserData(normalizedUser);
        setUser(normalizedUser);
    }, []);

    /**
     * Login with OAuth provider (Google/GitHub)
     */
    const loginWithOAuth = useCallback(async (provider: OAuthProvider): Promise<OAuthResult> => {
        const result = await startOAuthFlow(provider);

        if (result.success && result.token) {
            // Store token
            await setToken(result.token);

            if (result.user) {
                // Use user data from OAuth response
                const oauthUser: User = {
                    _id: result.user._id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName || '',
                    createdAt: new Date().toISOString(),
                };
                await setUserData(oauthUser);
                setUser(oauthUser);
            } else {
                // Fetch profile if user data wasn't included
                const { user: profileUser } = await authApi.getProfile();
                await setUserData(profileUser);
                setUser(profileUser);
            }
        }

        return result;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Ignore errors - we still want to clear local state
        } finally {
            await clearAuthData();
            setUser(null);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        const { user: profileUser } = await authApi.getProfile();
        setUser(profileUser);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithOAuth,
        logout,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
