"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function AuthScreen() {
  const [step, setStep] = useState<"email" | "verify">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()
  const inputs = useRef<TextInput[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleContinue = async () => {
    if (!email) return
    setLoading(true)

    // Mock API call to send OTP
    setTimeout(() => {
      setLoading(false)
      setStep("verify")
      setResendTimer(55) // Start countdown timer
    }, 1500)
  }

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)

    // Move to next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const enteredOtp = otp.join("")
    if (enteredOtp.length !== 6) return

    setLoading(true)
    // Mock API call to verify OTP
    setTimeout(() => {
      setLoading(false)
      // Navigate to main app or lobby
      router.replace("/lobby")
    }, 1500)
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResendTimer(55)
    }, 1000)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F23" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (step === "verify") {
                setStep("email")
                setOtp(["", "", "", "", "", ""])
              } else {
                router.back()
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 18,
              fontWeight: "600",
              color: "#8B5CF6",
              marginRight: 24,
            }}
          >
            Chessizen
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          {/* Logo */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "transparent",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 48,
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 40,
                color: "#FFFFFF",
                textShadowColor: "#8B5CF6",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              }}
            >
              {step === "email" ? "♔" : "🔒"}
            </Text>
          </View>

          {step === "email" ? (
            <>
              {/* Title */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Welcome Back
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: "#9CA3AF",
                  marginBottom: 48,
                  textAlign: "center",
                }}
              >
                Enter your email to continue
              </Text>

              {/* Email Input */}
              <View
                style={{
                  width: "100%",
                  marginBottom: 32,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#1A1A2E",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 1,
                    borderColor: "#374151",
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={loading || !email}
                style={{
                  width: "100%",
                  backgroundColor: loading || !email ? "#374151" : "#6B7280",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#6B7280",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Terms */}
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  textAlign: "center",
                  marginTop: 32,
                  paddingHorizontal: 20,
                }}
              >
                By continuing, you agree to our Terms of Service
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Verify Your Email
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: "#9CA3AF",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                We sent a 6-digit code to
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: "#8B5CF6",
                  marginBottom: 40,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {email}
              </Text>

              {/* OTP Input */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: 32,
                  paddingHorizontal: 10,
                }}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref!)}
                    style={{
                      width: 45,
                      height: 55,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: digit ? "#8B5CF6" : "#374151",
                      backgroundColor: "#1A1A2E",
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    editable={!loading}
                  />
                ))}
              </View>

              {/* Resend Timer */}
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 32,
                  textAlign: "center",
                }}
              >
                {resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={{ color: "#8B5CF6", fontWeight: "600" }}>Resend code</Text>
                  </TouchableOpacity>
                )}
              </Text>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading || otp.join("").length !== 6}
                style={{
                  width: "100%",
                  backgroundColor: loading || otp.join("").length !== 6 ? "#374151" : "#6B7280",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#6B7280",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    Verify
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
