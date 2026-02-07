/**
 * Register Screen
 * 
 * New user registration with form validation.
 * Supports OAuth (Google/GitHub) authentication.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { TextInput, Button } from '../../src/components/ui';
import { warmUpBrowser, coolDownBrowser } from '../../src/services/oauth.service';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function RegisterScreen() {
    const { register, loginWithOAuth } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
    const [errors, setErrors] = useState<{
        firstName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // Warm up browser for faster OAuth
    useEffect(() => {
        warmUpBrowser();
        return () => {
            coolDownBrowser();
        };
    }, []);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await register({
                fullName: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim() || undefined,
                },
                email: email.trim(),
                password,
            });
            // Navigation is handled by root layout
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        setOauthLoading(provider);
        try {
            const result = await loginWithOAuth(provider);

            if (!result.success && !result.cancelled) {
                Alert.alert(
                    'Authentication Failed',
                    result.error || `Failed to sign in with ${provider}`
                );
            }
            // If successful, navigation is handled by root layout
        } catch (error: any) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setOauthLoading(null);
        }
    };

    const isLoading = loading || oauthLoading !== null;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="sparkles" size={48} color={colors.accent.primary} />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start your AI journey with Jarvis</Text>
                    </View>

                    {/* OAuth Buttons */}
                    <View style={styles.oauthContainer}>
                        <TouchableOpacity
                            style={styles.oauthButton}
                            onPress={() => handleOAuthLogin('google')}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            {oauthLoading === 'google' ? (
                                <ActivityIndicator size="small" color={colors.text.primary} />
                            ) : (
                                <>
                                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                                    <Text style={styles.oauthButtonText}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.oauthButton}
                            onPress={() => handleOAuthLogin('github')}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            {oauthLoading === 'github' ? (
                                <ActivityIndicator size="small" color={colors.text.primary} />
                            ) : (
                                <>
                                    <Ionicons name="logo-github" size={20} color={colors.text.primary} />
                                    <Text style={styles.oauthButtonText}>Continue with GitHub</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <TextInput
                                    label="First Name"
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    error={errors.firstName}
                                    editable={!isLoading}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <TextInput
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <TextInput
                            label="Email"
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.email}
                            editable={!isLoading}
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                label="Password"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                error={errors.password}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={22}
                                    color={colors.text.tertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            label="Confirm Password"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            error={errors.confirmPassword}
                            editable={!isLoading}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={isLoading}
                            style={styles.button}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity disabled={isLoading}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },
    oauthContainer: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    oauthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.medium,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        minHeight: 52,
    },
    oauthButtonText: {
        color: colors.text.primary,
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border.subtle,
    },
    dividerText: {
        color: colors.text.tertiary,
        fontSize: fontSize.sm,
        paddingHorizontal: spacing.md,
    },
    form: {
        marginBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.md,
        top: 38,
        padding: spacing.xs,
    },
    button: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: fontSize.md,
    },
    linkText: {
        color: colors.accent.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
