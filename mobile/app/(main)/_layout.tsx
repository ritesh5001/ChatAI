/**
 * Main App Layout
 * 
 * Layout for authenticated screens (chat list, chat detail, profile).
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background.primary },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen
                name="chat/[id]"
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen name="profile" />
        </Stack>
    );
}
