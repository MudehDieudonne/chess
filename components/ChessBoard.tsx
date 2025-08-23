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

  // Force re-render by using key prop based on FEN
  const boardKey = `board-${fen}`;

  return (
    <View style={styles.container}>
      <Chessboard
        key={boardKey} // Force re-render when FEN changes
        fen={fen}
        onSquarePress={onSquarePress}
        highlightedSquares={getHighlightedSquares()}
        boardStyle={styles.board}
        lightSquareColor="#F0D9B5"
        darkSquareColor="#B58863"
        showCoordinates={true}
        showLegalMoves={false}
      />

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
    backgroundColor: '#B58863',
    borderRadius: 12,
    overflow: 'hidden'
  },
  board: {
    borderRadius: 12
  },
  gameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  gameOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016'
  }
});

export default ChessBoard;