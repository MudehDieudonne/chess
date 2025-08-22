import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Shield, Crown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const AuthScreen = () => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, sendOTP, verifyOTP } = useAuth();

  // Add this useEffect to debug the navigation
  React.useEffect(() => {
    console.log('Auth Screen - User state:', user);
    console.log('Auth Screen - Should redirect:', !!user);

    if (user) {
      console.log('Navigating to lobby...');
      router.replace('/lobby');
    }
  }, [user, router]);

  // Redirect if already authenticated
  // React.useEffect(() => {
  //   if (user) {
  //     router.replace('/lobby');
  //   }
  // }, [user]);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!email) return;

    setLoading(true);
    const success = await sendOTP(email);
    if (success) {
      setStep('verify');
      setResendTimer(60);
    }
    setLoading(false);
  };

  // Ensure handleVerifyOTP is defined in scope
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    const success = await verifyOTP(email, otp);
    if (success) {
      setTimeout(() => {
        console.log('Forcing navigation to lobby');
        router.replace('/lobby');
      }, 100);
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    const success = await sendOTP(email);
    if (success) {
      setResendTimer(60);
      Alert.alert('Success', 'New verification code sent to your email');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Crown size={32} color="#228B22" />
              <Text style={styles.title}>BrainChess</Text>
            </View>
            <Text style={styles.subtitle}>
              {step === 'email'
                ? 'Enter your email to get started'
                : 'Enter the verification code sent to your email'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                {step === 'email' ? (
                  <>
                    <Mail size={20} color="#2D5016" />
                    <Text style={styles.cardTitle}>Sign In / Sign Up</Text>
                  </>
                ) : (
                  <>
                    <Shield size={20} color="#2D5016" />
                    <Text style={styles.cardTitle}>Verify Code</Text>
                  </>
                )}
              </View>
              <Text style={styles.cardDescription}>
                {step === 'email'
                  ? "We'll send you a verification code to sign in"
                  : `Code sent to ${email}`}
              </Text>
            </View>

            <View style={styles.cardContent}>
              {step === 'email' ? (
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      (loading || !email) && styles.buttonDisabled
                    ]}
                    onPress={handleSendOTP}
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        Send Verification Code
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      value={otp}
                      onChangeText={text =>
                        setOtp(text.replace(/\D/g, '').slice(0, 6))
                      }
                      maxLength={6}
                      keyboardType="number-pad"
                      editable={!loading}
                    />
                    <Text style={styles.inputHint}>
                      Enter the 6-digit code sent to your email
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      (loading || otp.length !== 6) && styles.buttonDisabled
                    ]}
                    onPress={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Verify & Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.separator} />

                  <View style={styles.authActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setStep('email');
                        setOtp('');
                      }}
                    >
                      <Text style={styles.linkText}>← Change email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                    >
                      <Text
                        style={[
                          styles.linkText,
                          styles.resendLink,
                          (resendTimer > 0 || loading) && styles.linkDisabled
                        ]}
                      >
                        {resendTimer > 0
                          ? `Resend (${resendTimer}s)`
                          : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.statusHint}>
                <Text style={styles.statusHintText}>
                  {step === 'email'
                    ? 'Enter your email to receive a verification code'
                    : 'Check your email for the 6-digit verification code'}
                </Text>
                <Text style={styles.backendStatus}>
                  Backend: Connected to real authentication service
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228B22'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8'
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5016'
  },
  cardDescription: {
    fontSize: 14,
    color: '#666'
  },
  cardContent: {
    padding: 20
  },
  form: {
    gap: 16
  },
  inputContainer: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D5016'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 8,
    fontFamily: 'monospace'
  },
  inputHint: {
    fontSize: 12,
    color: '#666'
  },
  button: {
    backgroundColor: '#228B22',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#9ec19e'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  separator: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 16
  },
  authActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  linkText: {
    color: '#228B22',
    fontSize: 14
  },
  resendLink: {
    fontWeight: '500'
  },
  linkDisabled: {
    color: '#9ec19e'
  },
  statusHint: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    alignItems: 'center',
    gap: 8
  },
  statusHintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  backendStatus: {
    fontSize: 10,
    color: '#228B22',
    fontStyle: 'italic',
    fontWeight: '500'
  }
});

export default AuthScreen;
