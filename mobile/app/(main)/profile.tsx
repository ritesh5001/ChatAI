/**
 * Profile Screen
 * 
 * User profile view and settings.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/ui';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const getInitials = () => {
        const first = user?.firstName?.[0] || '';
        const last = user?.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.backButton} />
            </View>

            {/* Profile Info */}
            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                </View>

                <Text style={styles.name}>
                    {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>

                {/* Info Cards */}
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                        <Text style={styles.cardLabel}>Email</Text>
                        <Text style={styles.cardValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                        <Text style={styles.cardLabel}>Joined</Text>
                        <Text style={styles.cardValue}>
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="secondary"
                        style={styles.logoutButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    name: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        marginBottom: spacing.xl,
    },
    card: {
        width: '100%',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.xl,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    cardLabel: {
        flex: 1,
        marginLeft: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },
    cardValue: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },
    logoutContainer: {
        width: '100%',
        marginTop: 'auto',
    },
    logoutButton: {
        borderColor: colors.status.error,
    },
});
