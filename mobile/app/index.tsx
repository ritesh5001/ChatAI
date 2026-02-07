/**
 * App Entry Point
 * 
 * Redirects to appropriate screen based on auth state.
 */

import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // Root layout shows loading
    }

    if (isAuthenticated) {
        return <Redirect href="/(main)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
