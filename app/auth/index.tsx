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

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      router.replace('/lobby');
    }
  }, [user]);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!email) return;

    setLoading(true);

    // SIMULATED BACKEND: Accept any email format for testing
    // In production, validate email format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo: Any email format is accepted
      const isValidFormat = email.length > 3 && email.includes('@');

      if (isValidFormat) {
        setStep('verify');
        setResendTimer(60);
        Alert.alert('Success', 'Verification code sent to your email');
      } else {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return;

    setLoading(true);

    // SIMULATED BACKEND: Accept any 6-digit code for testing
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo: Any 6-digit code is accepted
      const isValidOTP = otp.length === 6 && /^\d+$/.test(otp);

      if (isValidOTP) {
        // Simulate successful authentication
        Alert.alert('Success', 'Successfully authenticated!');
        router.replace('/lobby');
      } else {
        Alert.alert('Invalid Code', 'Please enter a valid 6-digit code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResendTimer(60);
      Alert.alert('Code Resent', 'New verification code sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {/* Demo instructions */}
            <Text style={styles.demoInstructions}>
              {step === 'email'
                ? 'DEMO: Enter any email with @ symbol to continue'
                : 'DEMO: Enter any 6-digit number to verify'}
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

              <View style={styles.demoHint}>
                <Text style={styles.demoHintText}>
                  DEMO MODE: Any email with @ symbol and any 6-digit code will
                  work
                </Text>
                <Text style={styles.backendStatus}>
                  Backend: Simulated (Waiting for real backend integration)
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
    textAlign: 'center',
    marginBottom: 8
  },
  demoInstructions: {
    fontSize: 12,
    color: '#228B22',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 6
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
  demoHint: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    alignItems: 'center',
    gap: 8
  },
  demoHintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  backendStatus: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic'
  }
});

export default AuthScreen;
