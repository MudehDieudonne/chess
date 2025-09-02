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
      highlights[selectedSquare] = '#FFD700';
      legalMoves.forEach(move => {
        highlights[move] = '#90EE90';
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
          white: '#F0D9B5',
          black: '#B58863',
          lastMoveHighlight: '#FFFF00',
          checkmateHighlight: '#FF0000'
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
            <Text style={styles.gameOverlayText}>
              {game.isCheckmate()
                ? 'Checkmate!'
                : game.isDraw()
                  ? 'Draw!'
                  : game.isStalemate()
                    ? 'Stalemate!'
                    : 'Game Over'}
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
  aiOverlayText: { fontSize: 18, fontWeight: 'bold', color: '#FF8C00' },
  gameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  gameOverlayContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  gameOverlayText: { fontSize: 18, fontWeight: 'bold', color: '#2D5016' }
});

export default ChessBoard;
