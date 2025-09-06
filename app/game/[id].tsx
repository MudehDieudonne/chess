import ChessBoard from '@/components/ChessBoard';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Bot,
  ChevronLeft,
  Crown,
  Flag,
  Handshake,
  Home,
  RefreshCw,
  Undo2,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// Tooltip with animation
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
    <View style={{ alignItems: 'center', marginHorizontal: Spacing.medium }}>
      {visible && (
        <Animated.View
          style={[styles.tooltip, { opacity, transform: [{ translateY }] }]}
        >
          <Text style={styles.tooltipText}>{label}</Text>
        </Animated.View>
      )}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
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
  const {
    gameState,
    loadGame,
    game,
    resetGame,
    undoMove,
    makeMove,
    timeLeft,
    isAITurn,
    isAIThinking,
    lastAnimatedMove,
    lastMove,
    addMove
  } = useGame();

  const [activeTab, setActiveTab] = useState<'history' | 'assistant' | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [gameResult, setGameResult] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [isResigning, setIsResigning] = useState(false);
  const [isOfferingDraw, setIsOfferingDraw] = useState(false);

  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width * 0.95, height * 0.5, 400);

  // Debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-50), logMessage]);
  };

  useEffect(() => {
    addDebugLog('GameScreen mounted');
    addDebugLog(`Game ID from params: ${id}`);
    addDebugLog(`User: ${user?.id} - ${user?.email}`);

    const initializeGame = async () => {
      if (id && !gameState) {
        try {
          addDebugLog('Attempting to load game...');
          await loadGame(id as string);
          addDebugLog('Game loaded successfully');
        } catch (error) {
          const errorMsg = `Failed to load game: ${error instanceof Error ? error.message : String(error)}`;
          addDebugLog(errorMsg);
          Alert.alert('Error', 'Failed to load game');
        }
      }
      setLoading(false);
    };
    initializeGame();
  }, [id, gameState, loadGame]);

  // Handle game end
  useEffect(() => {
    if (game?.isGameOver() && !showResultModal) {
      let title = 'Game Over';
      let message = '';

      if (game.isCheckmate()) {
        title = 'Checkmate!';
        message = game.turn() === 'w' ? 'Black wins!' : 'White wins!';
      } else if (game.isDraw()) {
        title = 'Draw!';
        message = 'The game ended in a draw';
      } else if (game.isStalemate()) {
        title = 'Stalemate!';
        message = 'The game ended in stalemate';
      }

      setGameResult({ title, message });
      setShowResultModal(true);
      addDebugLog(`Game ended: ${title} - ${message}`);
    }
  }, [game, showResultModal]);

  const handleResign = async () => {
    addDebugLog('Resign button pressed');
    setIsResigning(true);

    try {
      // In a real implementation, you would emit a socket event to the backend
      // For now, we'll simulate the resignation
      addDebugLog('Emitting resign event to backend...');

      // Simulate backend processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGameResult({
        title: 'Resignation',
        message: 'You have resigned from the game'
      });
      setShowResultModal(true);
      addDebugLog('Game resigned successfully');
    } catch (error) {
      addDebugLog(`Resignation failed: ${error}`);
      Alert.alert('Error', 'Failed to resign from game');
    } finally {
      setIsResigning(false);
    }
  };

  const handleOfferDraw = async () => {
    addDebugLog('Draw offer button pressed');
    setIsOfferingDraw(true);

    try {
      // Emit draw offer to backend
      addDebugLog('Emitting draw offer to backend...');

      // Simulate backend processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Draw Offered', 'Draw offer has been sent to your opponent');
      addDebugLog('Draw offer sent successfully');
    } catch (error) {
      addDebugLog(`Draw offer failed: ${error}`);
      Alert.alert('Error', 'Failed to send draw offer');
    } finally {
      setIsOfferingDraw(false);
    }
  };

  const handleMove = (move: {
    from: string;
    to: string;
    promotion?: string;
  }) => {
    addDebugLog(`Player making move: ${JSON.stringify(move)}`);

    const moveResult = makeMove(
      move.from as any,
      move.to as any,
      move.promotion
    );

    if (moveResult) {
      addDebugLog(`Move validated locally: ${JSON.stringify(moveResult)}`);
      addDebugLog('Emitting makeMove to server...');
    } else {
      addDebugLog('Invalid move attempted - rejected by local validation');
    }
  };

  const handleUndo = () => {
    addDebugLog('Undo button pressed');
    if (undoMove) {
      undoMove();
      addDebugLog('Undo move executed');
    } else {
      addDebugLog('Undo feature not available');
      Alert.alert('Info', 'Undo feature not available in online games');
    }
  };

  const handleReset = () => {
    addDebugLog('Reset button pressed');
    resetGame();
    setShowResultModal(false);
    setGameResult(null);
    addDebugLog('Game reset');
  };

  const handleHome = () => {
    addDebugLog('Home button pressed');
    router.replace('/lobby');
  };

  const handleRestart = () => {
    addDebugLog('Restart button pressed');
    resetGame();
    setShowResultModal(false);
    setGameResult(null);
    addDebugLog('Game restarted');
  };

  const getGameStatus = () => {
    if (!game) return 'Loading...';
    if (game.isCheckmate()) return 'Checkmate';
    if (game.isCheck()) return 'Check';
    if (game.isDraw()) return 'Draw';
    if (game.isStalemate()) return 'Stalemate';
    if (isAIThinking) return 'AI is thinking...';
    return gameState?.status === 'active' ? 'Your turn' : 'Waiting';
  };

  const getTurnIndicator = () => {
    if (!game) return '';
    if (game.isGameOver()) return 'Game Over';
    if (isAIThinking) return 'AI Thinking...';
    return game.turn() === 'w' ? 'White to move' : 'Black to move';
  };

  if (loading || !gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Crown size={48} color={Colors.primaryButton[0]} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const isPlayerTurn =
    gameState?.playerColor === 'white'
      ? game?.turn() === 'w'
      : game?.turn() === 'b';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/lobby')}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getGameStatus()}</Text>
          <Text style={styles.turnIndicator}>{getTurnIndicator()}</Text>
        </View>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => setShowDebug(!showDebug)}
          onLongPress={() => setDebugLogs([])}
        >
          <Text style={styles.debugButtonText}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Panel */}
      {showDebug && (
        <View style={styles.debugPanel}>
          <ScrollView style={styles.debugScrollView}>
            {debugLogs.map((log, index) => (
              <Text key={index} style={styles.debugLogText}>
                {log}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeDebugButton}
            onPress={() => setShowDebug(false)}
          >
            <Text style={styles.closeDebugText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Opponent Info */}
      <PlayerInfo
        name="AI Opponent"
        rating={1847}
        isOpponent={true}
        time={timeLeft.black}
        isActive={!isPlayerTurn && !isAIThinking}
      />

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View
          style={[
            styles.boardContainer,
            { width: boardSize, height: boardSize }
          ]}
        >
          <ChessBoard onMove={handleMove} />
          {isAIThinking && (
            <View style={styles.aiThinkingOverlay}>
              <Text style={styles.aiThinkingText}>AI is thinking...</Text>
            </View>
          )}
        </View>

        {/* Icons below the board */}
        <View style={styles.iconsContainer}>
          <TooltipIcon label="Resign" onPress={handleResign}>
            <Flag size={28} color="#dc2626" />
          </TooltipIcon>

          <TooltipIcon label="Draw" onPress={handleOfferDraw}>
            <Handshake size={28} color="#FFFFFF" />
          </TooltipIcon>

          <TooltipIcon label="Reset" onPress={resetGame}>
            <RefreshCw size={28} color="#FFFFFF" />
          </TooltipIcon>

          <TooltipIcon label="Undo" onPress={undoMove}>
            <Undo2 size={28} color="#FFFFFF" />
          </TooltipIcon>
        </View>
      </View>

      {/* Player Info */}
      <PlayerInfo
        name={user?.displayName || 'Player'}
        rating={1654}
        time={timeLeft.white}
        isActive={isPlayerTurn && !isAIThinking}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TooltipIcon label="Resign" onPress={handleResign}>
          <Flag size={28} color="#dc2626" />
        </TooltipIcon>
        <TooltipIcon label="Draw" onPress={handleOfferDraw}>
          <Handshake size={28} color="#FFFFFF" />
        </TooltipIcon>
        <TooltipIcon label="Reset" onPress={handleReset}>
          <RefreshCw size={28} color="#FFFFFF" />
        </TooltipIcon>
        <TooltipIcon label="Undo" onPress={handleUndo}>
          <Undo2 size={28} color="#FFFFFF" />
        </TooltipIcon>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{gameResult?.title}</Text>
            <Text style={styles.modalMessage}>{gameResult?.message}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.restartButton]}
                onPress={handleRestart}
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.homeButton]}
                onPress={handleHome}
              >
                <Home size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Main Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlays */}
      {isResigning && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingOverlayText}>Resigning...</Text>
        </View>
      )}

      {isOfferingDraw && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingOverlayText}>Offering draw...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e'
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: '#16213e'
  },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center'
  },
  turnIndicator: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  backButton: { padding: 8 },
  debugButton: { padding: 8 },
  debugButtonText: { fontSize: 20, color: '#FFFFFF' },
  debugPanel: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    maxHeight: 300
  },
  debugScrollView: { maxHeight: 250 },
  debugLogText: {
    color: '#00FF00',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2
  },
  closeDebugButton: {
    backgroundColor: '#8B5CF6',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8
  },
  closeDebugText: { color: '#FFFFFF', fontWeight: 'bold' },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8
  },
  opponentInfo: { marginTop: 16 },
  playerDetails: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playerName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  playerRating: { fontSize: 12, color: '#9CA3AF' },
  timer: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center'
  },
  activeTimer: { backgroundColor: '#8B5CF6' },
  timerText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  activeTimerText: { color: '#FFFFFF' },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
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
    elevation: 8,
    position: 'relative'
  },
  aiThinkingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10
  },
  aiThinkingText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#374151'
  },
  tooltip: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tooltipText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: '#8B5CF6'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    gap: 8
  },
  restartButton: {
    backgroundColor: '#8B5CF6'
  },
  homeButton: {
    backgroundColor: '#374151'
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default GameScreen;
