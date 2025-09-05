import { useGame } from '@/contexts/GameContext';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import Chessboard from 'react-native-chessboard';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  className?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ onMove, className = '' }) => {
  const {
    game,
    gameState,
    selectedSquare,
    legalMoves,
    selectSquare,
    isAIThinking,
    lastAnimatedMove
  } = useGame();

  const animationRef = useRef(new Animated.Value(0)).current;
  const [showAnimation, setShowAnimation] = React.useState(false);
  const [animationData, setAnimationData] = React.useState<{
    from: string;
    to: string;
    piece: string;
  } | null>(null);

  // Prefer server-driven fen from gameState to avoid desync
  const fen = gameState?.fen || game?.fen() || 'start';

  React.useEffect(() => {
    console.log('[Board] fen updated ->', fen);
  }, [fen]);

  React.useEffect(() => {
    console.log('[Board] isAIThinking ->', isAIThinking);
  }, [isAIThinking]);

  // Handle AI move animations
  useEffect(() => {
    if (lastAnimatedMove) {
      console.log('[Board] Animating move:', lastAnimatedMove);

      try {
        // Get the piece that's being moved from the FEN
        const board = new Chess(fen);
        const piece = board.get(lastAnimatedMove.from);

        if (piece) {
          setAnimationData({
            from: lastAnimatedMove.from,
            to: lastAnimatedMove.to,
            piece: piece.type + piece.color
          });

          setShowAnimation(true);
          animationRef.setValue(0);

          Animated.timing(animationRef, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }).start(() => {
            setTimeout(() => {
              setShowAnimation(false);
              setAnimationData(null);
            }, 100);
          });
        }
      } catch (error) {
        console.log('[Board] Error setting up animation:', error);
      }
    }
  }, [lastAnimatedMove]);

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
      // Selected square highlight (gold)
      highlights[selectedSquare] = '#FFD700';

      // Legal moves highlight (semi-transparent purple)
      legalMoves.forEach(move => {
        highlights[move] = 'rgba(139, 92, 246, 0.4)';
      });
    }
    return highlights;
  };

  // Calculate position for animated piece
  const getSquarePosition = (square: string) => {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = 8 - parseInt(square[1]); // 1=7, 2=6, etc.

    const squareSize = 350 / 8;
    return {
      left: file * squareSize,
      top: rank * squareSize,
      width: squareSize,
      height: squareSize
    };
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
        durations={{ move: 300 }}
        colors={{
          white: '#808080',
          black: '#000000',
          lastMoveHighlight: '#8B5CF6',
          checkmateHighlight: '#FF0000'
        }}
        showCoordinates={true}
        showLegalMoves={false}
        pieceStyle={{
          fontWeight: 'bold'
        }}
        coordinatesStyle={{
          fontSize: 12,
          color: '#A0AEC0',
          fontWeight: '500'
        }}
      />

      {/* Animated piece overlay for AI moves */}
      {showAnimation && animationData && (
        <Animated.View
          style={[
            styles.animatedPiece,
            {
              transform: [
                {
                  translateX: animationRef.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      getSquarePosition(animationData.from).left,
                      getSquarePosition(animationData.to).left
                    ]
                  })
                },
                {
                  translateY: animationRef.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      getSquarePosition(animationData.from).top,
                      getSquarePosition(animationData.to).top
                    ]
                  })
                }
              ],
              opacity: animationRef.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0]
              })
            }
          ]}
        >
          <Text
            style={[
              styles.pieceText,
              animationData.piece.startsWith('w')
                ? styles.whitePiece
                : styles.blackPiece
            ]}
          >
            {getPieceSymbol(animationData.piece)}
          </Text>
        </Animated.View>
      )}

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
                ? game.turn() === 'w'
                  ? 'Black Wins!'
                  : 'White Wins!'
                : 'Match Ended'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function to get Unicode chess symbols
const getPieceSymbol = (piece: string) => {
  const symbols: { [key: string]: string } = {
    wk: '♔',
    wq: '♕',
    wr: '♖',
    wb: '♗',
    wn: '♘',
    wp: '♙',
    bk: '♚',
    bq: '♛',
    br: '♜',
    bb: '♝',
    bn: '♞',
    bp: '♟'
  };
  return symbols[piece] || '';
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 8
  },
  aiOverlay: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  aiOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
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
    elevation: 10
  },
  gameOverlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center'
  },
  gameOverlaySubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9
  },
  animatedPiece: {
    position: 'absolute',
    width: 43.75, // 350 / 8
    height: 43.75,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  pieceText: {
    fontSize: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  whitePiece: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)'
  },
  blackPiece: {
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.3)'
  }
});

export default ChessBoard;
