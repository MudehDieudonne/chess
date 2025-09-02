// app/lobby.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import {
  BarChart3,
  Bot,
  Clock,
  Crown,
  History,
  Home,
  LogOut,
  RefreshCw,
  Settings,
  User,
  Users
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

// ✅ ScaleButton avec animation tactile
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ScaleButton({ children, onPress, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
}

interface GameHistoryItem {
  id: string;
  opponent: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  date: string;
  moves: number;
}

const Lobby = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { createGame, loading } = useGame();
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const animations = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const historyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(
      150,
      animations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      )
    ).start();

    setTimeout(() => {
      Animated.timing(historyAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, [animations, historyAnim]);

  const cardAnimatedStyle = (index: number) => ({
    opacity: animations[index],
    transform: [
      { scale: animations[index].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
      { translateY: animations[index].interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
    ],
  });

  const historyAnimatedStyle = {
    opacity: historyAnim,
    transform: [{ translateY: historyAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  // Demo game history
  const [gameHistory] = useState<GameHistoryItem[]>([
    { id: 'demo1', opponent: 'ChessBot Pro', result: '1-0', date: new Date().toISOString(), moves: 34 },
    { id: 'demo2', opponent: 'Player_Magnus', result: '1/2-1/2', date: new Date(Date.now() - 86400000).toISOString(), moves: 67 },
    { id: 'demo3', opponent: 'AI Grandmaster', result: '0-1', date: new Date(Date.now() - 172800000).toISOString(), moves: 42 },
  ]);

  const handlePlayVsAI = async () => {
    try {
      const gameId = await createGame(true);
      router.push(`/game/${gameId}`);
    } catch {
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
    } catch {
      Alert.alert('Error', 'Failed to copy invite link.');
    }
  };

  const handleJoinGame = () => {
    Alert.prompt(
      'Join Game',
      'Enter game invite token:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: token => token && router.push(`/invite/${token}`) },
      ],
      'plain-text'
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    Alert.alert('Refreshed', 'Game history updated');
  };

  const getResultBadge = (result: string, isWin: boolean) => {
    const badgeStyle = result === '1/2-1/2' ? styles.drawBadge : isWin ? styles.winBadge : styles.lossBadge;
    const badgeText = result === '1/2-1/2' ? 'Draw' : isWin ? 'Win' : 'Loss';
    return (
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  // ✅ fonction pour rendre un bouton de tab avec glow carré
  const renderTabButton = (icon: React.ReactNode, label: string, path: string) => {
    const isActive = pathname === path;
    return (
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push(path)}>
        <View style={isActive ? styles.activeIconContainer : undefined}>
          {React.cloneElement(icon as React.ReactElement, {
            color: isActive ? '#2e7d32' : '#1b5e20', // vert plus flashy si actif
            size: 26,
          })}
        </View>
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#f3e5f5', '#e1bee7']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Crown size={26} color="#000" />
              <Text style={[styles.title, {color: '#000'}]}>BrainChess</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Settings size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <LogOut size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>
              <Plus size={18} color="#1b5e20" /> Start Playing
            </Text> */}

            <Animated.View style={[styles.card, cardAnimatedStyle(0)]}>
              <View style={styles.cardHeader}>
                <Bot size={20} color="#1b5e20" />
                <Text style={styles.cardTitle}>Play vs AI</Text>
              </View>
              <ScaleButton style={styles.gradientButton} onPress={handlePlayVsAI}>
                <LinearGradient colors={['#43a047', '#2e7d32']} style={styles.gradientButtonInner}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start Game</Text>}
                </LinearGradient>
              </ScaleButton>
            </Animated.View>

            <Animated.View style={[styles.card, cardAnimatedStyle(1)]}>
              <View style={styles.cardHeader}>
                <Users size={20} color="#1565c0" />
                <Text style={styles.cardTitle}>Create Invite</Text>
              </View>
              <ScaleButton style={styles.gradientButton} onPress={handleCreateInvite}>
                <LinearGradient colors={['#42a5f5', '#1565c0']} style={styles.gradientButtonInner}>
                  <Text style={styles.buttonText}>Create Invite Link</Text>
                </LinearGradient>
              </ScaleButton>
            </Animated.View>

            <Animated.View style={[styles.card, cardAnimatedStyle(2)]}>
              <View style={styles.cardHeader}>
                <History size={20} color="#f57c00" />
                <Text style={styles.cardTitle}>Join Game</Text>
              </View>
              <ScaleButton style={styles.gradientButton} onPress={handleJoinGame}>
                <LinearGradient colors={['#ffb74d', '#f57c00']} style={styles.gradientButtonInner}>
                  <Text style={styles.buttonText}>Join Game</Text>
                </LinearGradient>
              </ScaleButton>
            </Animated.View>
          </View>

          {/* Recent Games */}
          <Animated.View style={[styles.section, historyAnimatedStyle]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, {color: '#000'}]}>
                <History size={18} color="#000" /> Recent Games
              </Text>
              <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
                <RefreshCw size={18} color="#000" />
              </TouchableOpacity>
            </View>

            {gameHistory.map(game => {
              const isWin = game.result === '1-0';
              return (
                <View key={game.id} style={styles.historyItem}>
                  <View style={styles.historyRow}>
                    <Text style={styles.opponent}>{game.opponent}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {getResultBadge(game.result, isWin)}
                      <View style={{ width: 8 }} />
                      <Clock size={14} color="#555" />
                      <Text style={[styles.gameInfo, { marginLeft: 6 }]}>{game.moves} moves</Text>
                      <Text style={[styles.gameInfo, { marginLeft: 8 }]}>{formatDate(game.date)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </Animated.View>

        </ScrollView>

        {/* 🔹 Bottom Sidebar avec highlight carré */}
        <View style={styles.bottomBar}>
          {renderTabButton(<Home />, 'Home', '/lobby')}
          {renderTabButton(<BarChart3 />, 'Stats', '/stats')}
          {renderTabButton(<User />, 'Profile', '/profile')}
        </View>
      </View>
    </LinearGradient>
  );
};

export default Lobby;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', gap: 16 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  gradientButton: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  gradientButtonInner: { paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  opponent: { fontSize: 16, fontWeight: '600', color: '#222' },
  gameInfo: { fontSize: 13, color: '#555' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 4,
  },
  tabButton: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, color: '#1b5e20' },
  activeTabLabel: { color: '#2e7d32', fontWeight: '800' },

  // 🔹 Glow carré
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.15)', // halo vert clair
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeIcon: {
    textShadowColor: 'rgba(46, 125, 50, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  winBadge: { backgroundColor: '#2e7d32' },
  lossBadge: { backgroundColor: '#e53935' },
  drawBadge: { backgroundColor: '#757575' },
});
