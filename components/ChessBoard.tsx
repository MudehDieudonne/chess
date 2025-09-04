import { useGame } from '@/contexts/GameContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Chessboard from 'react-native-chessboard';

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
    selectSquare
  } = useGame();

  // Convert chess.js FEN to react-native-chessboard format
  const fen = game?.fen() || 'start';

  const onSquarePress = (square: string) => {
    if (selectedSquare) {
      if (selectedSquare === square) {
        selectSquare(null);
      } else if (legalMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else {
        selectSquare(square);
      }
    } else {
      selectSquare(square);
    }
  };

  // Get legal moves for highlighting
  const getHighlightedSquares = () => {
    const highlights: { [square: string]: string } = {};

    if (selectedSquare) {
      // Selected square highlight (purple/violet)
      highlights[selectedSquare] = '#8B5CF6';

      // Legal moves highlight (semi-transparent purple)
      legalMoves.forEach(move => {
        highlights[move] = 'rgba(139, 92, 246, 0.4)';
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
  },
  board: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A5568',
  },
  gameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
});

export default ChessBoard;