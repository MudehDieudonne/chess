import { useGame } from '@/contexts/GameContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Chessboard from 'react-native-chessboard';

interface ChessBoardProps {
  className?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ className = '' }) => {
  const { game, selectedSquare, legalMoves, makeMove, selectSquare } = useGame();

  const fen = game?.fen() || 'start';

  const boardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(boardAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const onSquarePress = (square: string) => {
    if (selectedSquare) {
      if (selectedSquare === square) selectSquare(null);
      else if (legalMoves.includes(square)) makeMove(selectedSquare, square);
      else selectSquare(square);
    } else selectSquare(square);
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
      <Animated.View
        style={{
          opacity: boardAnim,
          transform: [
            { scale: boardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ],
        }}
      >
        <LinearGradient colors={['#f3e5f5', '#e1bee7']} style={styles.gradient}>
          <Chessboard
            fen={fen}
            onSquarePress={onSquarePress}
            highlightedSquares={getHighlightedSquares()}
            boardStyle={styles.board}
            lightSquareColor="transparent" // transparent pour montrer le gradient
            darkSquareColor="transparent"
            showCoordinates={true}
            showLegalMoves={false}
          />
        </LinearGradient>
      </Animated.View>

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
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  board: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    overflow: 'hidden',
  },
  gameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  gameOverlayContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
  },
});

export default ChessBoard;
