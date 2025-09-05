import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface GameStats {
  wins: number;
  losses: number;
}

interface Distribution {
  ai: GameStats;
  human: GameStats;
  draws: number;
}

interface Overview {
  rating: number;
  highestRating: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  draws: number;
  winRate: string;
  streak: number;
}

interface UserStats {
  id: string;
  username: string;
  email: string;
  overview: Overview;
  distribution: Distribution;
}

interface UserContextType {
  userStats: UserStats | null;
  loading: boolean;
  refreshUserStats: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<boolean>;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user, getAccessToken } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async (userId: string) => {
    try {
      setLoading(true);
      const token = await getAccessToken();

      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `${API_URL}/analytics/${userId}/profile`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }

      const backendData = await response.json();
      console.log(backendData);

      // Transform backend data to match our frontend structure
      const stats: UserStats = {
        id: userId,
        username: backendData.username,
        email: backendData.email,
        overview: backendData.overview,
        distribution: backendData.distribution
      };

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      Alert.alert('Error', 'Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserStats = async () => {
    if (user?.id) {
      await fetchUserStats(user.id);
    }
  };

  const updateDisplayName = async (newName: string): Promise<boolean> => {
    try {
      const token = await getAccessToken();

      if (!token || !user?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newName })
      });

      if (!response.ok) {
        throw new Error(`Failed to update username: ${response.status}`);
      }

      // Refresh stats to get updated data from backend
      await refreshUserStats();
      Alert.alert('Success', 'Username updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username');
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserStats(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const value: UserContextType = {
    userStats,
    loading,
    refreshUserStats,
    updateDisplayName
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
