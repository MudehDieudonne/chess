import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, AuthResponse } from '@/lib/auth-api';

// Create a universal storage solution that works on web and native
const universalStorage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },

  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    } else {
      return SecureStore.getItemAsync(key);
    }
  },

  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  }
};

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
        universalStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        universalStorage.getItem(STORAGE_KEYS.USER)
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
        universalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token),
        universalStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          data.refresh_token
        ),
        universalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
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
        universalStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
        universalStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
        universalStorage.deleteItem(STORAGE_KEYS.USER)
      ]);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  };

  // Send OTP to email
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

  // Verify OTP and log in
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyOtp({ email, otp });

      if (response.error) {
        Alert.alert('Error', response.error);
        return false;
      }

      if (!response.data?.verified) {
        Alert.alert('Error', response.data?.message || 'Invalid OTP');
        return false;
      }

      if (response.data.verified && response.data.verified.access_token) {
        await storeAuthData(response.data.verified);
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

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = await universalStorage.getItem(
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
      const refreshToken = await universalStorage.getItem(
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
