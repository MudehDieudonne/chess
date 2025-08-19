// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext'; // Import GameProvider

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        {' '}
        {/* Wrap with GameProvider */}
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/index" />
            <Stack.Screen name="auth/verify" />
            <Stack.Screen name="lobby" />
            <Stack.Screen name="game/[id]" />
            <Stack.Screen name="invite/[token]" />
            <Stack.Screen name="history" />
            <Stack.Screen name="settings" />
          </Stack>
        </SafeAreaProvider>
      </GameProvider>
    </AuthProvider>
  );
}
