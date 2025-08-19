import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function InviteLobby() {
  const { token } = useLocalSearchParams<{ token: string }>();
  return (
    <View className="flex-1 items-center justify-center gap-2">
      <Text className="text-2xl font-bold">Invite Lobby</Text>
      <Text className="opacity-70">Waiting for opponent…</Text>
      <Text className="mt-2">Token: {token}</Text>
    </View>
  );
}
