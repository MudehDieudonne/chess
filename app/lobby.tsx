'use client';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/userContext';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const Lobby = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { userStats, loading: userStatsLoading } = useUser();
  const { createGame, loading } = useGame();
  
  const handlePlayVsAI = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to play vs AI');
      return;
    }
    try {
      const gameId = await createGame(true);
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to create AI game:', error);
      Alert.alert('Error', 'Failed to create AI game. Please try again.');
    }
  };

  const handleCreateInvite = async () => {
    const inviteToken = 'invite_' + Date.now();
    const inviteUrl = `https://yourapp.com/invite/${inviteToken}`;
    try {
      await Clipboard.setStringAsync(inviteUrl);
      Alert.alert('Invite Created', 'Invite link copied to clipboard!');
      router.push(`/invite/${inviteToken}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite link.');
      console.error(error)
    }
  };

  const handlePlayOffline = () => {
    router.push('/offline');
  };

  // Get display name - prioritize backend username, then auth context, then fallback
  const displayName =
    userStats?.username ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'ChessPlayer';

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Chessizen</Text>
        <Text style={styles.appSubtitle}>Master the Game</Text>
        <View style={styles.userCard}>
          <Text style={styles.userName}>{displayName}</Text>
          {userStatsLoading ? (
            <ActivityIndicator color="#C084FC" size="small" />
          ) : (
            <Text style={styles.userStats}>
              🏆 {userStats?.overview.rating || 800} 🔥{' '}
              {userStats?.overview.streak || 0} streak
            </Text>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Play Online */}
          <TouchableOpacity
            onPress={() => router.push('/online')}
            style={styles.onlineButtonWrapper}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineButton}
            >
              <Text style={styles.onlineButtonText}>⚡ Play Online</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Play vs AI */}
          <TouchableOpacity
            style={styles.onlineButtonWrapper}
            onPress={handlePlayVsAI}
            disabled={loading}
          >
            <LinearGradient
              colors={['#7C3AED', '#6D28D9', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.onlineButtonText}>🤖 Play vs AI</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Play vs Friend */}
          <TouchableOpacity
            style={styles.onlineButtonWrapper}
            onPress={handleCreateInvite}
          >
            <LinearGradient
              colors={['#5B21B6', '#6D28D9', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineButton}
            >
              <Text style={styles.onlineButtonText}>👥 Play vs Friend</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Play Offline */}
          <TouchableOpacity
            style={styles.onlineButtonWrapper}
            onPress={handlePlayOffline}
          >
            <LinearGradient
              colors={['#312E81', '#3B32A1', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineButton}
            >
              <Text style={styles.onlineButtonText}>🎮 Play Offline</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar currentPage="lobby" />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0F0F23'
  },
  container: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 16
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A855F7'
  },
  appSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4
  },
  userCard: {
    marginTop: 20,
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  userStats: {
    fontSize: 14,
    color: '#C084FC',
    marginTop: 4
  },
  onlineButtonWrapper: {
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  onlineButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  onlineButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default Lobby;
