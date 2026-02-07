/**
 * Chat Detail Screen
 * 
 * Real-time AI chat with streaming responses.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../../src/api/chat.api';
import {
    initSocket,
    sendMessage,
    disconnectSocket,
} from '../../../src/services/socket.service';
import { Message } from '../../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../../src/theme/colors';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [connected, setConnected] = useState(false);

    // Load initial messages
    useEffect(() => {
        if (!id) return;

        loadMessages();
        setupSocket();

        return () => {
            disconnectSocket();
        };
    }, [id]);

    const loadMessages = async () => {
        try {
            const response = await chatApi.getMessages(id!);
            setMessages(response.messages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            Alert.alert('Error', 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = async () => {
        await initSocket({
            onConnect: () => setConnected(true),
            onDisconnect: () => setConnected(false),
            onResponseStart: (chatId) => {
                if (chatId === id) {
                    setIsStreaming(true);
                    setStreamingContent('');
                }
            },
            onResponseChunk: (data) => {
                if (data.chat === id) {
                    setStreamingContent(prev => prev + data.content);
                }
            },
            onResponseEnd: (data) => {
                if (data.chat === id) {
                    setIsStreaming(false);
                    setSending(false);
                    // Add the complete AI message
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        content: data.content,
                        role: 'model',
                        chatId: id!,
                        userId: '',
                        createdAt: new Date().toISOString(),
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    setStreamingContent('');
                }
            },
            onResponseError: (data) => {
                if (data.chat === id) {
                    setIsStreaming(false);
                    setSending(false);
                    setStreamingContent('');
                    Alert.alert('Error', data.error);
                }
            },
            onError: (error) => {
                console.error('Socket error:', error);
                setSending(false);
            },
        });
    };

    const handleSend = useCallback(() => {
        if (!inputText.trim() || sending || !connected) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputText.trim(),
            role: 'user',
            chatId: id!,
            userId: '',
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setSending(true);
        setInputText('');

        sendMessage({
            chat: id!,
            content: userMessage.content,
        });
    }, [inputText, id, sending, connected]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages.length > 0 || isStreaming) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, streamingContent, isStreaming]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';

        return (
            <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isUser ? styles.userText : styles.aiText,
                        ]}
                    >
                        {item.content}
                    </Text>
                </View>
            </View>
        );
    };

    const renderStreamingMessage = () => {
        if (!isStreaming || !streamingContent) return null;

        return (
            <View style={styles.messageRow}>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                    <Text style={[styles.messageText, styles.aiText]}>
                        {streamingContent}
                        <Text style={styles.cursor}>▋</Text>
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Jarvis AI</Text>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusDot,
                                connected ? styles.statusOnline : styles.statusOffline,
                            ]}
                        />
                        <Text style={styles.statusText}>
                            {connected ? 'Online' : 'Connecting...'}
                        </Text>
                    </View>
                </View>
                <View style={styles.backButton} />
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={renderStreamingMessage}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="sparkles"
                                    size={48}
                                    color={colors.accent.primary}
                                />
                                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                                <Text style={styles.emptySubtitle}>
                                    Ask me anything! I'm here to help.
                                </Text>
                            </View>
                        )}
                    />
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.text.tertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={2000}
                        editable={!sending}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || sending || !connected) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending || !connected}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.text.primary} />
                        ) : (
                            <Ionicons name="send" size={20} color={colors.text.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    statusOnline: {
        backgroundColor: colors.status.success,
    },
    statusOffline: {
        backgroundColor: colors.status.warning,
    },
    statusText: {
        fontSize: fontSize.xs,
        color: colors.text.tertiary,
    },
    keyboardView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: spacing.md,
        flexGrow: 1,
    },
    messageRow: {
        marginBottom: spacing.sm,
        alignItems: 'flex-start',
    },
    userMessageRow: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        backgroundColor: colors.chat.userBubble,
        borderBottomRightRadius: borderRadius.sm,
    },
    aiBubble: {
        backgroundColor: colors.chat.aiBubble,
        borderBottomLeftRadius: borderRadius.sm,
    },
    messageText: {
        fontSize: fontSize.md,
        lineHeight: 22,
    },
    userText: {
        color: colors.chat.userText,
    },
    aiText: {
        color: colors.chat.aiText,
    },
    cursor: {
        color: colors.accent.primary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
        backgroundColor: colors.background.primary,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        paddingTop: spacing.sm,
        fontSize: fontSize.md,
        color: colors.text.primary,
        maxHeight: 120,
        marginRight: spacing.sm,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
