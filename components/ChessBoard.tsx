import Colors from '@/constants/Colors';
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
      highlights[selectedSquare] = Colors.chessHighlight;
      legalMoves.forEach(move => {
        highlights[move] = Colors.chessMoveHighlight;
      });
    }

    return highlights;
  };

  const customPieceStyle = (piece: string) => {
    if (piece.toLowerCase() === piece) {
      return {
        color: Colors.chessPieceBlack,
        fontWeight: 'bold',
      };
    }
    return {
      color: Colors.chessPieceWhite,
      fontWeight: 'bold',
    };
  };

  return (
    <View style={styles.container}>
      <Chessboard
        fen={fen}
        onSquarePress={onSquarePress}
        highlightedSquares={getHighlightedSquares()}
        boardStyle={styles.board}
        colors={{
          white: Colors.chessWhiteSquare,
          black: Colors.chessBlackSquare,
          lastMoveHighlight: Colors.chessHighlight,
          checkmateHighlight: Colors.chessCheckHighlight,
        }}
        showCoordinates={true}
        showLegalMoves={false}
        pieceStyle={customPieceStyle}
        coordinatesStyle={{
          fontSize: 12,
          color: Colors.chessCoordinates,
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
    backgroundColor: Colors.cardBackground,
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
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.chessHighlight,
    shadowColor: Colors.chessHighlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gameOverlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.chessHighlight,
    marginBottom: 8,
    textAlign: 'center',
  },
  gameOverlaySubtext: {
    fontSize: 16,
    color: Colors.primaryText,
    textAlign: 'center',
    opacity: 0.9,
  }
});

export default ChessBoard;
