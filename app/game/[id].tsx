import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import GameChessboard from '@/components/Chessboard';

// Placeholder for the Assistant Panel component
const AssistantPanel = () => (
  <View className="h-48 w-full rounded-lg bg-gray-800 p-4 lg:h-full lg:w-80">
    <Text className="text-lg font-bold text-white">AI Assistant</Text>
    <Text className="mt-2 text-gray-400">Suggested Move: e4</Text>
    <Text className="mt-1 text-gray-400">
      Explanation: Controls the center.
    </Text>
  </View>
);

export default function GameScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Adds the screen title in the header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Game: ${id}`,
          headerTintColor: 'white',
          headerStyle: { backgroundColor: '#111827' }
        }}
      />

      <View className="flex-1 p-2 md:p-4">
        {/* Main container for responsive layout */}
        <View className="h-full w-full flex-1 flex-col lg:flex-row">
          {/* Main Content: Board + Player Info */}
          <View className="flex-1 items-center justify-center p-2">
            {/* Opponent Info */}
            <View className="w-full max-w-md rounded-t-lg bg-gray-800 p-3">
              <Text className="font-semibold text-white">
                Opponent: AI Level 5
              </Text>
            </View>

            {/* Chessboard */}
            <View className="aspect-square w-full max-w-md">
              <GameChessboard />
            </View>

            {/* Your Info */}
            <View className="mb-4 w-full max-w-md rounded-b-lg bg-gray-800 p-3 lg:mb-0">
              <Text className="font-semibold text-white">You: Player 1</Text>
            </View>
          </View>

          {/* Side Panel: AI Assistant */}
          <View className="w-full justify-center lg:ml-4 lg:w-80">
            <AssistantPanel />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
