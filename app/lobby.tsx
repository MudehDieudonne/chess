import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Clipboard,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Crown,
  Bot,
  Users,
  Plus,
  History,
  Settings,
  LogOut,
  Clock,
  Trophy,
  RefreshCw
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

interface GameHistoryItem {
  id: string;
  opponent: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  date: string;
  moves: number;
}

const Lobby = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { createGame, loading } = useGame();
  const [refreshing, setRefreshing] = useState(false);

  // Demo game history
  const [gameHistory] = useState<GameHistoryItem[]>([
    {
      id: 'demo1',
      opponent: 'ChessBot Pro',
      result: '1-0',
      date: new Date().toISOString(),
      moves: 34
    },
    {
      id: 'demo2',
      opponent: 'Player_Magnus',
      result: '1/2-1/2',
      date: new Date(Date.now() - 86400000).toISOString(),
      moves: 67
    },
    {
      id: 'demo3',
      opponent: 'AI Grandmaster',
      result: '0-1',
      date: new Date(Date.now() - 172800000).toISOString(),
      moves: 42
    }
  ]);

  const handlePlayVsAI = async () => {
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

  const handleJoinGame = () => {
    Alert.prompt(
      'Join Game',
      'Enter game invite token:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Join',
          onPress: token => {
            if (token) {
              router.push(`/invite/${token}`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    Alert.alert('Refreshed', 'Game history updated');
  };

  const getResultBadge = (result: string, isWin: boolean) => {
    const badgeStyle =
      result === '1/2-1/2'
        ? styles.drawBadge
        : isWin
          ? styles.winBadge
          : styles.lossBadge;

    const badgeText = result === '1/2-1/2' ? 'Draw' : isWin ? 'Win' : 'Loss';

    return (
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1543092587-d8b8feaf4e4f?w=800&auto=format&fit=crop&q=80'
      }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Crown size={28} color="#228B22" />
            <Text style={styles.title}>BrainChess</Text>
          </View>

          <View style={styles.userContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.displayName || 'Player'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/settings')}
              >
                <Settings size={20} color="#2D5016" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={logout}>
                <LogOut size={20} color="#2D5016" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Plus size={20} color="#2D5016" /> Start Playing
            </Text>

            <View style={styles.actionGrid}>
              {/* Play vs AI */}
              <View style={styles.actionCard}>
                <View style={styles.cardHeader}>
                  <Bot size={20} color="#228B22" />
                  <Text style={styles.cardTitle}>Play vs AI</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Challenge our intelligent chess engine
                </Text>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handlePlayVsAI}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Start Game</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Create Invite */}
              <View style={styles.actionCard}>
                <View style={styles.cardHeader}>
                  <Users size={20} color="#228B22" />
                  <Text style={styles.cardTitle}>Create Invite</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Invite a friend to play with you
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCreateInvite}
                >
                  <Text style={styles.buttonText}>Create Invite Link</Text>
                </TouchableOpacity>
              </View>

              {/* Join Game */}
              <View style={styles.actionCard}>
                <View style={styles.cardHeader}>
                  <Trophy size={20} color="#228B22" />
                  <Text style={styles.cardTitle}>Join Game</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Enter an invite token to join
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.outlineButton]}
                  onPress={handleJoinGame}
                >
                  <Text style={styles.outlineButtonText}>Join Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recent Games */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <History size={20} color="#2D5016" /> Recent Games
              </Text>
              <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
                <RefreshCw size={18} color="#2D5016" />
              </TouchableOpacity>
            </View>

            <View style={styles.historyCard}>
              {gameHistory.map((game, index) => {
                const isWin = game.result === '1-0';
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[
                      styles.historyItem,
                      index < gameHistory.length - 1 && styles.historyItemBorder
                    ]}
                    onPress={() => router.push(`/history/${game.id}`)}
                  >
                    <View style={styles.historyContent}>
                      <View style={styles.opponentInfo}>
                        {game.opponent.includes('Bot') ||
                        game.opponent.includes('AI') ? (
                          <Bot size={16} color="#666" />
                        ) : (
                          <Users size={16} color="#666" />
                        )}
                        <Text style={styles.opponentName}>{game.opponent}</Text>
                      </View>

                      <View style={styles.gameInfo}>
                        <View style={styles.gameStats}>
                          <Clock size={14} color="#666" />
                          <Text style={styles.gameStatText}>
                            {game.moves} moves
                          </Text>
                        </View>
                        {getResultBadge(game.result, isWin)}
                        <Text style={styles.gameDate}>
                          {formatDate(game.date)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const testGameCreation = async () => {
  try {
    const response = await gameApi.startGame({ vsAI: true });
    if (!response.error) {
      console.log('Game created:', response.data);
      router.push(`/game/${response.data.gameId}`);
    }
  } catch (error) {
    console.error('Game creation failed:', error);
  }
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  container: {
    flex: 1
  },
  content: {
    padding: 16
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    paddingTop: Platform.OS === 'ios' ? 50 : 20
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228B22'
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  userInfo: {
    alignItems: 'flex-end'
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016'
  },
  userEmail: {
    fontSize: 12,
    color: '#666'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  iconButton: {
    padding: 8
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionGrid: {
    gap: 16
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5016'
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
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
  secondaryButton: {
    backgroundColor: '#2D5016'
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#228B22'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  outlineButtonText: {
    color: '#228B22',
    fontSize: 16,
    fontWeight: '600'
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  historyItem: {
    padding: 16
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8'
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D5016'
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  gameStatText: {
    fontSize: 12,
    color: '#666'
  },
  gameDate: {
    fontSize: 12,
    color: '#666'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white'
  },
  winBadge: {
    backgroundColor: '#228B22'
  },
  lossBadge: {
    backgroundColor: '#dc2626'
  },
  drawBadge: {
    backgroundColor: '#666'
  }
});

export default Lobby;
