import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = () => {
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      // Here you can add a toast message for invalid email
      console.log('Invalid email');
      return;
    }

    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to the verify screen on success
      router.push({ pathname: '/auth/verify', params: { email } });
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center px-6"
      >
        <View className="w-full max-w-sm">
          <View className="mb-10 items-center">
            <Feather name="shield" size={64} color="#A78BFA" />
            <Text className="mt-4 text-4xl font-bold text-white">
              Chess Citizens
            </Text>
            <Text className="mt-2 text-lg text-gray-400">Enter to play</Text>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-300">
              Email Address
            </Text>
            <TextInput
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-base text-white placeholder:text-gray-500"
              placeholder="you@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            className={`flex-row items-center justify-center rounded-lg py-4 ${loading ? 'bg-violet-700' : 'bg-violet-600'}`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-lg font-semibold text-white">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
