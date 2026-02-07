/**
 * Primary Button Component
 * 
 * Gradient-styled button with loading state.
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

interface Props {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    textStyle,
}: Props) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                variant === 'ghost' && styles.ghost,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'ghost' ? colors.accent.primary : colors.text.primary}
                    size="small"
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        variant === 'ghost' && styles.ghostText,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    primary: {
        backgroundColor: colors.accent.primary,
    },
    secondary: {
        backgroundColor: colors.background.tertiary,
        borderWidth: 1,
        borderColor: colors.border.medium,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: colors.text.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    ghostText: {
        color: colors.accent.primary,
    },
});
