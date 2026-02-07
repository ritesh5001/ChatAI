/**
 * Jarvis AI Mobile - Dark Mode Theme
 * 
 * Design Philosophy:
 * - Dark-first for AMOLED screens and reduced eye strain
 * - High contrast for readability
 * - Purple accent (matching Jarvis AI brand)
 */

export const colors = {
    // Backgrounds (dark to light)
    background: {
        primary: '#0a0a0f',      // Main app background
        secondary: '#12121a',    // Cards, modals
        tertiary: '#1a1a24',     // Input fields, elevated surfaces
        elevated: '#22222e',     // Hover states, active items
    },

    // Text
    text: {
        primary: '#ffffff',       // Main text
        secondary: '#a0a0b0',     // Secondary/muted text
        tertiary: '#6b6b7a',      // Placeholder, disabled
        inverse: '#0a0a0f',       // Text on light backgrounds
    },

    // Brand accent - Purple gradient
    accent: {
        primary: '#6366f1',       // Primary actions
        secondary: '#818cf8',     // Hover/active states
        tertiary: '#a5b4fc',      // Subtle highlights
        gradient: ['#6366f1', '#8b5cf6'], // Gradient for buttons
    },

    // Status colors
    status: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },

    // Chat specific
    chat: {
        userBubble: '#6366f1',    // User message background
        aiBubble: '#1a1a24',      // AI message background
        userText: '#ffffff',
        aiText: '#e0e0e8',
    },

    // Borders
    border: {
        subtle: '#2a2a36',
        medium: '#3a3a48',
        strong: '#4a4a5a',
    },

    // Shadows (for elevation)
    shadow: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
} as const;

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const fontFamily = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type FontSize = typeof fontSize;
