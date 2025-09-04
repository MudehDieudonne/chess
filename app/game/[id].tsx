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
  RefreshCw,
  Settings,
  Undo2,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
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

// Timer Component
const Timer = ({ time, isActive }: { time: number; isActive: boolean }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.timer, isActive && styles.activeTimer]}>
      <Text style={[styles.timerText, isActive && styles.activeTimerText]}>
        {formatTime(time)}
      </Text>
    </View>
  );
};

// Player Info Component
const PlayerInfo = ({ 
  name, 
  rating, 
  isOpponent, 
  time, 
  isActive 
}: { 
  name: string; 
  rating: number; 
  isOpponent?: boolean; 
  time: number;
  isActive: boolean;
}) => {
  return (
    <View style={[styles.playerInfo, isOpponent && styles.opponentInfo]}>
      <View style={styles.playerDetails}>
        <View style={styles.playerIcon}>
          {isOpponent ? (
            <Bot size={16} color="#FFFFFF" />
          ) : (
            <User size={16} color="#FFFFFF" />
          )}
        </View>
        <View>
          <Text style={styles.playerName}>{name}</Text>
          <Text style={styles.playerRating}>Rating: {rating}</Text>
        </View>
      </View>
      <Timer time={time} isActive={isActive} />
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
  
  // Timer states
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(645); // 10:45
  const [currentTurn, setCurrentTurn] = useState<'w' | 'b'>('w');

  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width * 0.95, height * 0.5, 400);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (game && !game.isGameOver()) {
        const turn = game.turn();
        setCurrentTurn(turn);
        
        if (turn === 'w') {
          setWhiteTime(prev => Math.max(0, prev - 1));
        } else {
          setBlackTime(prev => Math.max(0, prev - 1));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game]);

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

  const getGameStatus = () => {
    if (!game) return 'Loading...';
    if (game.isCheckmate()) return 'Checkmate';
    if (game.isCheck()) return 'Check';
    if (game.isDraw()) return 'Draw';
    if (game.isStalemate()) return 'Stalemate';
    return 'Ranked Match';
  };

  if (loading || !gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Crown size={48} color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const isWhiteTurn = currentTurn === 'w';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/lobby')}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{getGameStatus()}</Text>

        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Opponent Info */}
      <PlayerInfo 
        name="GrandMaster99"
        rating={1847}
        isOpponent={true}
        time={blackTime}
        isActive={!isWhiteTurn}
      />

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

      {/* Player Info */}
      <PlayerInfo 
        name="ChessMaster"
        rating={1654}
        time={whiteTime}
        isActive={isWhiteTurn}
      />

      {/* Bottom Bar avec Tooltips animés */}
      <View style={styles.bottomBar}>
        <TooltipIcon label="Resign" onPress={handleResign}>
          <Flag size={28} color="#dc2626" />
        </TooltipIcon>

        <TooltipIcon label="Draw" onPress={handleOfferDraw}>
          <Handshake size={28} color="#FFFFFF" />
        </TooltipIcon>

        <TooltipIcon label="Reset" onPress={() => resetGame()}>
          <RefreshCw size={28} color="#FFFFFF" />
        </TooltipIcon>

        <TooltipIcon label="Undo" onPress={undoMove}>
          <Undo2 size={28} color="#FFFFFF" />
        </TooltipIcon>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a1a2e' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e'
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#FFFFFF' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 7,
    paddingBottom: 16,
    backgroundColor: '#16213e',
  },
  backButton: { 
    padding: 5 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#8B5CF6',
    textAlign: 'center',
    marginTop: 'auto'
  },
  settingsButton: {
    padding: 5,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  opponentInfo: {
    marginTop: 16,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerRating: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timer: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeTimer: {
    backgroundColor: '#8B5CF6',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTimerText: {
    color: '#FFFFFF',
  },
  mainContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 20,
  },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 5,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  tooltip: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  }
});

export default GameScreen;