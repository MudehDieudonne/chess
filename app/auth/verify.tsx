// import { Feather } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// export default function VerifyOtpScreen() {
//   const router = useRouter();
//   const { email } = useLocalSearchParams();
//   const [otp, setOtp] = useState(['', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const inputs = useRef<TextInput[]>([]);

//   const handleOtpChange = (text: string, index: number) => {
//     const newOtp = [...otp];
//     newOtp[index] = text;
//     setOtp(newOtp);

//     // Move to next input
//     if (text && index < 3) {
//       inputs.current[index + 1]?.focus();
//     }
//   };

//   const handleVerify = () => {
//     const enteredOtp = otp.join('');
//     if (enteredOtp.length !== 4) {
//       console.log('Invalid OTP');
//       return;
//     }
//     setLoading(true);
//     // Mock API call to verify OTP
//     setTimeout(() => {
//       setLoading(false);
//       // On successful verification, store JWT and navigate to lobby
//       // For now, we just navigate
//       router.replace('/lobby');
//     }, 1500);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-900">
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         className="flex-1 items-center justify-center p-6"
//       >
//         <View className="w-full max-w-sm">
//           <View className="mb-8 items-center">
//             <Feather name="key" size={64} color="#A78BFA" />
//             <Text className="mt-4 text-3xl font-bold text-white">
//               Enter Code
//             </Text>
//             <Text className="text-md mt-2 text-center text-gray-400">
//               We sent a verification code to{' '}
//               <Text className="font-bold text-violet-400">{email}</Text>
//             </Text>
//           </View>

//           <View className="mb-8 flex-row justify-between">
//             {otp.map((digit, index) => (
//               <TextInput
//                 key={index}
//                 ref={ref => (inputs.current[index] = ref!)}
//                 className="h-16 w-16 rounded-lg border border-gray-700 bg-gray-800 text-center text-2xl font-bold text-white"
//                 keyboardType="number-pad"
//                 maxLength={1}
//                 value={digit}
//                 onChangeText={text => handleOtpChange(text, index)}
//               />
//             ))}
//           </View>

//           <TouchableOpacity
//             onPress={handleVerify}
//             disabled={loading}
//             className="flex-row items-center justify-center rounded-lg bg-violet-500 py-4"
//           >
//             {loading ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <Text className="text-lg font-bold text-white">Verify</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }
