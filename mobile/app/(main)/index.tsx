/**
 * Chat List Screen (Main Screen)
 * 
 * Displays all user chats with options to create, rename, and delete.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { chatApi } from '../../src/api/chat.api';
import { Chat } from '../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function ChatListScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creating, setCreating] = useState(false);

    const loadChats = useCallback(async () => {
        try {
            const fetchedChats = await chatApi.getChats();
            setChats(fetchedChats);
        } catch (error: any) {
            console.error('Failed to load chats:', error);
            Alert.alert('Error', 'Failed to load chats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadChats();
    };

    const handleCreateChat = async () => {
        setCreating(true);
        try {
            const newChat = await chatApi.createChat({ title: 'New Chat' });
            router.push(`/(main)/chat/${newChat.id}`);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to create chat');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteChat = (chatId: string, title: string) => {
        Alert.alert(
            'Delete Chat',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await chatApi.deleteChat(chatId);
                            setChats(chats.filter(c => c.id !== chatId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete chat');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/(main)/chat/${item.id}`)}
            onLongPress={() => handleDeleteChat(item.id, item.title)}
            activeOpacity={0.7}
        >
            <View style={styles.chatIcon}>
                <Ionicons name="chatbubble" size={24} color={colors.accent.primary} />
            </View>
            <View style={styles.chatContent}>
                <Text style={styles.chatTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.chatDate}>{formatDate(item.updatedAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Conversations Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start a new chat with Jarvis AI
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Hello, {user?.firstName || 'there'}! 👋
                    </Text>
                    <Text style={styles.headerTitle}>Your Chats</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
            </View>

            {/* Chat List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatItem}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.accent.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB - New Chat */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleCreateChat}
                disabled={creating}
                activeOpacity={0.8}
            >
                {creating ? (
                    <ActivityIndicator color={colors.text.primary} />
                ) : (
                    <Ionicons name="add" size={28} color={colors.text.primary} />
                )}
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.md,
    },
    greeting: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    chatIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    chatContent: {
        flex: 1,
    },
    chatTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    chatDate: {
        fontSize: fontSize.xs,
        color: colors.text.tertiary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 60,
        height: 60,
        borderRadius: borderRadius.full,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
