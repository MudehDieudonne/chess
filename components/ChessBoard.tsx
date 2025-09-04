import { useGame } from '@/contexts/GameContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Chessboard from 'react-native-chessboard';

// --- STEP 1: Update the props interface to accept the onMove function ---
interface ChessBoardProps {
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  className?: string;
}

// --- STEP 2: Destructure `onMove` from the component's props ---
const ChessBoard: React.FC<ChessBoardProps> = ({ onMove, className = '' }) => {
  const {
    game,
    gameState,
    selectedSquare,
    legalMoves,
    selectSquare,
    isAIThinking
  } = useGame();

  // Prefer server-driven fen from gameState to avoid desync
  const fen = gameState?.fen || game?.fen() || 'start';

  React.useEffect(() => {
    console.log('[Board] fen updated ->', fen);
  }, [fen]);

  React.useEffect(() => {
    console.log('[Board] isAIThinking ->', isAIThinking);
  }, [isAIThinking]);

  const onChessMove = (info: any) => {
    // Call the onMove prop with the move data
    onMove({
      from: info.move.from,
      to: info.move.to,
      promotion: info.move.promotion
    });
  };

  const getHighlightedSquares = () => {
    const highlights: { [square: string]: string } = {};
    if (selectedSquare) {
      // Selected square highlight (purple/violet)
      highlights[selectedSquare] = '#8B5CF6';

      // Legal moves highlight (semi-transparent purple)
      highlights[selectedSquare] = '#FFD700';
      legalMoves.forEach(move => {
        highlights[move] = 'rgba(139, 92, 246, 0.4)';
      });
    }
    return highlights;
  };

  return (
    <View style={styles.container}>
      <Chessboard
        key={fen}
        fen={fen}
        onMove={onChessMove}
        gestureEnabled={true}
        withLetters={true}
        withNumbers={true}
        boardSize={350}
        durations={{ move: 180 }}
        colors={{
          white: "#808080",
          black: "#000000",
          lastMoveHighlight: "#8B5CF6",
          checkmateHighlight: "#FF0000",
        }}
        showCoordinates={true}
        showLegalMoves={false}
        pieceStyle={{
          // Style des pièces plus contrastées
          fontWeight: 'bold'
        }}
        coordinatesStyle={{
          fontSize: 12,
          color: '#A0AEC0',
          fontWeight: '500'
        }}
      />

      {isAIThinking && (
        <View style={styles.aiOverlay}>
          <Text style={styles.aiOverlayText}>AI is thinking...</Text>
        </View>
      )}

      {game?.isGameOver() && (
        <View style={styles.gameOverlay}>
          <View style={styles.gameOverlayContent}>
            <Text style={styles.gameOverlayTitle}>
              {game.isCheckmate()
                ? 'Checkmate!'
                : game.isDraw()
                  ? 'Draw!'
                  : game.isStalemate()
                    ? 'Stalemate!'
                    : 'Game Over'}
            </Text>
            <Text style={styles.gameOverlaySubtext}>
              {game.isCheckmate() 
                ? game.turn() === 'w' ? 'Black Wins!' : 'White Wins!'
                : 'Match Ended'
              }
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 8,
    overflow: 'hidden'
  },
  board: { borderRadius: 12 },
  aiOverlay: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  board: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A5568',
  },
  aiOverlayText: { fontSize: 18, fontWeight: 'bold', color: '#FF8C00' },
  gameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  gameOverlayContent: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gameOverlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameOverlaySubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  }
  gameOverlayText: { fontSize: 18, fontWeight: 'bold', color: '#2D5016' }
});

export default ChessBoard;