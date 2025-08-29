import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Chessboard from 'react-native-chessboard';
import { useGame } from '@/contexts/GameContext';

interface ChessBoardProps {
  className?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ className = '' }) => {
  const {
    game,
    gameState,
    selectedSquare,
    legalMoves,
    makeMove,
    selectSquare,
    isAITurn
  } = useGame();

  const fen = game?.fen() || 'start';

  const onSquarePress = (square: string) => {
    if (isAITurn) return; // Disable user moves while waiting for AI

    if (selectedSquare) {
      if (selectedSquare === square) {
        selectSquare(null); // Deselect if clicked again
      } else if (legalMoves.includes(square)) {
        makeMove(selectedSquare, square); // Move triggers socket emit
      } else {
        selectSquare(square); // Select new square
      }
    } else {
      selectSquare(square);
    }
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
        fen={fen}
        onSquarePress={onSquarePress}
        highlightedSquares={getHighlightedSquares()}
        boardStyle={styles.board}
        lightSquareColor="#F0D9B5"
        darkSquareColor="#B58863"
        showCoordinates
        showLegalMoves={false}
      />

      {isAITurn && (
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
