import ChessBoard from '@/components/ChessBoard';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bot,
  Crown,
  Flag,
  Handshake,
  History,
  Lightbulb,
  RefreshCw,
  Undo2,
  User
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// --- Tooltip avec animation ---
const TooltipIcon = ({
  label,
  onPress,
  children
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(5)).current;

  const showTooltip = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 5,
        duration: 150,
        useNativeDriver: true
      })
    ]).start(() => setVisible(false));
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {visible && (
        <Animated.View
          style={[
            styles.tooltip,
            { opacity, transform: [{ translateY }] }
          ]}
        >
          <Text style={styles.tooltipText}>{label}</Text>
        </Animated.View>
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

const GameScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState, loadGame, game, resetGame, undoMove } = useGame();
  const [activeTab, setActiveTab] = useState<'history' | 'assistant' | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width * 0.9, height * 0.6, 500);

  React.useEffect(() => {
    const initializeGame = async () => {
      if (id && !gameState) {
        await loadGame(id as string);
      }
      setLoading(false);
    };
    initializeGame();
  }, [id, gameState, loadGame]);

  const handleResign = () => {
    Alert.alert('Resign Game', 'Are you sure you want to resign?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resign',
        style: 'destructive',
        onPress: () => {
          resetGame();
          router.replace('/lobby');
        }
      }
    ]);
  };

  const handleOfferDraw = () => {
    Alert.alert('Draw Offer', 'Draw offer sent to opponent');
  };

  const getCurrentTurn = () => {
    return game?.turn() === 'w' ? 'White' : 'Black';
  };

  const getGameStatus = () => {
    if (!game) return 'Loading...';
    if (game.isCheckmate()) return 'Checkmate';
    if (game.isCheck()) return 'Check';
    if (game.isDraw()) return 'Draw';
    if (game.isStalemate()) return 'Stalemate';
    return 'Active';
  };

  if (loading || !gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Crown size={48} color="#228B22" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/lobby')}
        >
          <ArrowLeft size={24} color="#2D5016" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.opponentInfo}>
            {gameState.opponent?.includes('AI') ||
            gameState.opponent?.includes('Bot') ? (
              <Bot size={16} color="#2D5016" />
            ) : (
              <User size={16} color="#2D5016" />
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              vs {gameState.opponent}
            </Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {getCurrentTurn()}'s turn • {getGameStatus()}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setActiveTab('history')}
          >
            <History size={22} color="#2D5016" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setActiveTab('assistant')}
          >
            <Lightbulb size={22} color="#2D5016" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View
          style={[
            styles.boardContainer,
            { width: boardSize, height: boardSize }
          ]}
        >
          <ChessBoard />
        </View>
      </View>

      {/* Bottom Bar avec Tooltips animés */}
      <View style={styles.bottomBar}>
        <TooltipIcon label="Resign" onPress={handleResign}>
          <Flag size={28} color="#dc2626" />
        </TooltipIcon>

        <TooltipIcon label="Draw" onPress={handleOfferDraw}>
          <Handshake size={28} color="#228B22" />
        </TooltipIcon>

        <TooltipIcon label="Reset" onPress={() => resetGame()}>
          <RefreshCw size={28} color="#2D5016" />
        </TooltipIcon>

        <TooltipIcon label="Undo" onPress={undoMove}>
          <Undo2 size={28} color="#2D5016" />
        </TooltipIcon>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    minHeight: 60
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  opponentInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2D5016' },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { padding: 8 },
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8'
  },
  tooltip: {
    position: 'absolute',
    bottom: 30
  },
  tooltipText: {
    color: '#2D5016',
    fontSize: 13,
    fontWeight: '500'
  }
});

export default GameScreen;
