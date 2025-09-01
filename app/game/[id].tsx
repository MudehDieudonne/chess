import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
  useWindowDimensions,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Flag,
  Handshake,
  Bot,
  Crown,
  History,
  Lightbulb,
  X
} from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import ChessBoard from '@/components/ChessBoard';
import AssistantPanel from '@/components/AssistantPanel';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { Move } from '@/types';

const SERVER_URL = __DEV__
  ? 'http://localhost:3005'
  : 'https://your-production-server.com';

const GameScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  const { gameState, loadGame, makeMove, addMove } = useGame();
  const { width, height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'assistant' | null>(
    null
  );
  const [isAIThinking, setIsAIThinking] = useState(false);

  const boardSize = Math.min(width * 0.9, height * 0.6, 500);

  // Debug: track component lifecycle
  useEffect(() => {
    console.log('GameScreen mounted - Game ID:', id);
    return () => {
      console.log('GameScreen unmounted');
      disconnectSocket();
    };
  }, []);

  // Debug: track gameState changes
  useEffect(() => {
    if (gameState) {
      console.log('GameState updated:', gameState.id);
    }
  }, [gameState]);

  // Main initialization effect
  useEffect(() => {
    console.log('GameScreen init - User:', user);
    console.log('GameScreen init - Game ID:', id);

    if (!id || !user?.id) {
      setError('Game ID or user information is missing.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        if (!gameState) {
          console.log('Loading game...');
          await loadGame(id as string);
        }

        const token = await getAccessToken();
        if (!token) {
          throw new Error('Access token not found');
        }

        console.log('Connecting to socket...');
        const socket = connectSocket({
          gameId: id as string,
          userId: user.id,
          token: token
        });

        socket.on('connect', () => {
          console.log('Socket connected successfully to game:', id);
          if (isMounted) setLoading(false);

          // Emit joinGame event to backend
          console.log('Emitting joinGame event');
                  socket.emit('joinGame', id as string);
        });

        socket.on(
          'connected',
          (data: { message: string; clientId: string }) => {
            console.log('Server connection acknowledged:', data.message);
          }
        );

        socket.on('connect_error', err => {
          console.error('Socket connection error:', err);
          if (isMounted) {
            setError('Could not connect to the game server.');
            setLoading(false);
          }
        });

        socket.on('aiMoveMade', (data: { move: any; currentFen: string }) => {
          console.log('AI move received:', data);
          if (isMounted) {
            // Update the game state with the AI move
            const aiMove: Move = {
              from: data.move.from,
              to: data.move.to,
              san: data.move.san,
              fenAfter: data.currentFen,
              timestamp: Date.now()
            };
            addMove(aiMove);
            setIsAIThinking(false);
            console.log('AI move processed and board updated');
          }
        });

        socket.on('aiThinking', () => {
          console.log('AI started thinking...');
          if (isMounted) {
            setIsAIThinking(true);
          }
        });

        socket.on(
          'playerJoined',
          (data: { playerId: string; userId: string }) => {
            console.log('Player joined game:', data);
          }
        );

        socket.on('moveMade', (gameData: any) => {
          console.log('Move made event received:', gameData);
        });

        socket.on('gameUpdate', (payload: any) => {
          console.log('Game update received:', payload);
        });

        socket.on('gameStarted', (gameData: any) => {
          console.log('Game started event received:', gameData);
        });
      } catch (err) {
        console.error('GameScreen init error:', err);
        if (isMounted) {
          setError('Failed to initialize the game.');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      console.log('GameScreen cleanup');
      isMounted = false;
    };
  }, [id, user?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Connection timeout. Please check your network.');
      }
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const onPlayerMove = async (move: {
    from: string;
    to: string;
    promotion?: string;
  }) => {
    try {
      console.log('Player making move:', move);
      const result = makeMove(move.from, move.to, move.promotion);

      if (result) {
        console.log('Move validated locally:', result);
        const socket = getSocket();

        if (socket && socket.connected) {
          console.log('Emitting makeMove to server:', {
            gameId: id,
            move: result
          });
          socket.emit('makeMove', {
            gameId: id,
            dto: result
          });
        } else {
          console.warn('Socket not connected, cannot send move to server');
        }
      } else {
        Alert.alert('Invalid Move', 'That move is not allowed.');
      }
    } catch (e) {
      console.error('Invalid move:', e);
      Alert.alert('Invalid Move', 'That move is not allowed.');
    }
  };

  const handleResign = () => {
    Alert.alert('Resign', 'Are you sure you want to resign?', [
      { text: 'Cancel' },
      { text: 'Resign', style: 'destructive' }
    ]);
  };

  const handleOfferDraw = () => {
    Alert.alert('Offer Draw', 'Are you sure you want to offer a draw?', [
      { text: 'Cancel' },
      { text: 'Yes' }
    ]);
  };

  const getCurrentTurn = () => {
    if (!gameState) return '';
    if (isAIThinking) return 'AI thinking...';
    return gameState.turn === 'w' ? 'White' : 'Black';
  };

  const getGameStatus = () => {
    if (!gameState) return 'Loading...';
    if (isAIThinking) return 'AI thinking...';
    if (gameState.isCheckmate) return 'Checkmate';
    if (gameState.isDraw) return 'Draw';
    if (gameState.isCheck) return 'Check';
    return 'In Progress';
  };

  const reloadGame = async () => {
    setError(null);
    setLoading(true);
    try {
      if (id) await loadGame(id as string);
    } catch (err) {
      setError('Failed to reload game');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Crown size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={reloadGame}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/lobby')}
        >
          <ArrowLeft size={24} color="#2D5016" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.opponentInfo}>
            <Bot size={16} color="#2D5016" />
            <Text style={styles.headerTitle}>vs {gameState.opponent}</Text>
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

      <View
        style={[styles.boardContainer, { width: boardSize, height: boardSize }]}
      >
        <ChessBoard onMove={onPlayerMove} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.resignButton]}
          onPress={handleResign}
        >
          <Flag size={20} color="#fff" />
          <Text style={styles.controlText}>Resign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.drawButton]}
          onPress={handleOfferDraw}
        >
          <Handshake size={20} color="#228B22" />
          <Text style={styles.drawText}>Draw</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={activeTab !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveTab(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: height * 0.7 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'history' ? 'Move History' : 'AI Assistant'}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#2D5016" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {activeTab === 'history' && (
                <ScrollView style={styles.historyList}>
                  {gameState.moves.length === 0 ? (
                    <Text style={styles.noMovesText}>No moves yet</Text>
                  ) : (
                    gameState.moves.map((move, index) => (
                      <View key={index} style={styles.moveItem}>
                        <Text style={styles.moveNumber}>
                          {Math.floor(index / 2) + 1}.
                        </Text>
                        <Text style={styles.moveNotation}>{move.san}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>
              )}
              {activeTab === 'assistant' && <AssistantPanel />}
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  retryButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryText: { color: 'white', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8'
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  opponentInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2D5016' },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { padding: 8 },
  boardContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center'
  },
  resignButton: { backgroundColor: '#dc2626' },
  drawButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#228B22'
  },
  controlText: { color: 'white', fontWeight: '600', fontSize: 14 },
  drawText: { color: '#228B22', fontWeight: '600', fontSize: 14 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8'
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#2D5016' },
  closeButton: { padding: 4 },
  modalBody: { padding: 20 },
  historyList: { maxHeight: 300 },
  moveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  moveNumber: { width: 30, color: '#666', fontSize: 14 },
  moveNotation: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '500',
    color: '#2D5016'
  },
  noMovesText: { textAlign: 'center', color: '#666', padding: 20 }
});

export default GameScreen;
