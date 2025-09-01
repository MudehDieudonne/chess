import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Chessboard from 'react-native-chessboard';
import { useGame } from '@/contexts/GameContext';

// --- STEP 1: Update the props interface to accept the onMove function ---
interface ChessBoardProps {
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  className?: string;
}

// --- STEP 2: Destructure `onMove` from the component's props ---
const ChessBoard: React.FC<ChessBoardProps> = ({ onMove, className = '' }) => {
  const {
    game,
    selectedSquare,
    legalMoves,
    selectSquare,
    isAITurn
    // Note: We no longer need `makeMove` from the context here
  } = useGame();

  const fen = game?.fen() || 'start';
  
  console.log('ChessBoard: Component rendered with FEN:', fen);
  console.log('ChessBoard: Game object:', game);
  console.log('ChessBoard: isAITurn:', isAITurn);

  const onSquarePress = (square: string) => {
    console.log('ChessBoard: Square pressed:', square);
    console.log('ChessBoard: isAITurn:', isAITurn);
    console.log('ChessBoard: selectedSquare:', selectedSquare);
    console.log('ChessBoard: legalMoves:', legalMoves);
    
    // For testing, let's try to make a simple move without checking AI turn
    if (selectedSquare) {
      if (selectedSquare === square) {
        selectSquare(null); // Deselect if clicked again
      } else {
        // Try to make a move regardless of legal moves for testing
        console.log('ChessBoard: Attempting move from', selectedSquare, 'to', square);
        onMove({ from: selectedSquare, to: square });
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
      <Text style={{color: 'red', fontSize: 16, marginBottom: 10}}>
        Debug: FEN = {fen}
      </Text>
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
