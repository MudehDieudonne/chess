import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  Platform,
  useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Flag,
  Handshake,
  User,
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

const GameScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState, loadGame, game, resetGame } = useGame();
  const [activeTab, setActiveTab] = useState<'history' | 'assistant' | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
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
      {/* Header - Minimal */}
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

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Chess Board - Centered with proper sizing */}
        <View
          style={[
            styles.boardContainer,
            { width: boardSize, height: boardSize }
          ]}
        >
          <ChessBoard />
        </View>

        {/* Game Controls */}
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
            <Handshake size={20} color="#2D5016" />
            <Text style={styles.drawText}>Draw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for History and Assistant */}
      <Modal
        visible={activeTab !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveTab(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: height * 0.7 }]}>
            {/* Modal Header */}
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

            {/* Modal Body */}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
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
  backButton: {
    padding: 8
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12
  },
  headerIcon: {
    padding: 8
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  resignButton: {
    backgroundColor: '#dc2626'
  },
  drawButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#228B22'
  },
  controlText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  drawText: {
    color: '#228B22',
    fontWeight: '600',
    fontSize: 14
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5016'
  },
  closeButton: {
    padding: 4
  },
  modalBody: {
    padding: 20
  },
  historyList: {
    maxHeight: 300
  },
  moveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  moveNumber: {
    width: 30,
    color: '#666',
    fontSize: 14
  },
  moveNotation: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '500',
    color: '#2D5016'
  },
  noMovesText: {
    textAlign: 'center',
    color: '#666',
    padding: 20
  }
});

export default GameScreen;
