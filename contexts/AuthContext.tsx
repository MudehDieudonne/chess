import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthResponse, VerifyOtpResponse } from '@/lib/auth-api';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, userData] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER)
      ]);

      if (accessToken && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeAuthData = async (data: AuthResponse) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access_token),
        SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          data.refresh_token
        ),
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.user))
      ]);
      setUser(data.user);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER)
      ]);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.sendOtp({ email });

      if (response.error) {
        Alert.alert('Error', response.error);
        return false;
      }

      Alert.alert('Success', 'OTP sent to your email!');
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      return false;
    }
  };
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyOtp({ email, otp });
      console.log('Full verify response:', response);

      if (response.error) {
        Alert.alert('Error', response.error);
        return false;
      }

      // Check if verification was successful
      if (!response.data?.verified) {
        Alert.alert('Error', response.data?.message || 'Invalid OTP');
        return false;
      }

      // FIX: The tokens are in response.data.verified, not response.data.tokens
      if (response.data.verified && response.data.verified.access_token) {
        console.log('Storing auth data:', response.data.verified);
        await storeAuthData(response.data.verified);

        // Set the user state to trigger navigation
        setUser(response.data.verified.user);

        Alert.alert('Success', 'OTP verified successfully!');
        return true;
      }

      Alert.alert('Error', 'Authentication failed - no tokens received');
      return false;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN
      );
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      await clearAuthData();
      Alert.alert('Success', 'Logged out successfully');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN
      );
      if (refreshToken) {
        const response = await authApi.refreshToken({ refreshToken });

        if (!response.error && response.data) {
          await storeAuthData(response.data);
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
