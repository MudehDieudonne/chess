import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';

export default function LobbyScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Play vs AI',
      icon: <FontAwesome5 name="robot" size={24} color="#A78BFA" />,
      action: () => router.push('/game/new-ai')
    },
    {
      title: 'Play Online',
      icon: <Ionicons name="globe-outline" size={24} color="#A78BFA" />,
      action: () => console.log('Play Online') // Placeholder
    },
    {
      title: 'Invite a Friend',
      icon: (
        <MaterialCommunityIcons
          name="human-greeting-variant"
          size={24}
          color="#A78BFA"
        />
      ),
      action: () => console.log('Invite Friend') // Placeholder
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-900 p-6">
      <View className="flex-1 justify-center">
        <Text className="mb-12 text-center text-5xl font-bold text-white">
          Choose a Game
        </Text>

        <View className="space-y-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.action}
              className="flex-row items-center rounded-lg border border-gray-700 bg-gray-800 p-6"
            >
              <View className="mr-4">{item.icon}</View>
              <Text className="text-xl font-semibold text-white">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
