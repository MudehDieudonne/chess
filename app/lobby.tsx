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
    }
  };
  const handlePlayOffline = () => {
    router.push('/offline');
  };
  // Get display name - prioritize backend username, then auth context, then fallback
  const displayName =
    userStats?.username ||
    user?.displayName ||
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
          <TouchableOpacity onPress={() => router.push('/online')}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>⚡ Play Online</Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* Play vs AI */}
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handlePlayVsAI}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.aiButtonText}>🤖 Play vs AI</Text>
            )}
          </TouchableOpacity>
          {/* Play vs Friend */}
          <TouchableOpacity
            style={styles.friendButton}
            onPress={handleCreateInvite}
          >
            <Text style={styles.friendButtonText}>👥 Play vs Friend</Text>
          </TouchableOpacity>
          {/* Play Offline */}
          <TouchableOpacity
            style={styles.offlineButton}
            onPress={handlePlayOffline}
          >
            <Text style={styles.offlineButtonText}>🎮 Play Offline</Text>
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
  primaryButton: {
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  aiButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  friendButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  friendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  offlineButton: {
    backgroundColor: '#312E81',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  offlineButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  }
});
export default Lobby;
