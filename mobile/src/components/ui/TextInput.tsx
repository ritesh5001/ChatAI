/**
 * Styled Text Input Component
 * 
 * Consistent input styling with dark mode support.
 */

import React from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

interface Props extends TextInputProps {
    label?: string;
    error?: string;
}

export function TextInput({ label, error, style, ...props }: Props) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <RNTextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style,
                ]}
                placeholderTextColor={colors.text.tertiary}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text.secondary,
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.background.tertiary,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    inputError: {
        borderColor: colors.status.error,
    },
    error: {
        color: colors.status.error,
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
    },
});
