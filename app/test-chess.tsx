import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import GameChessboard from '@/components/ChessBoard';
import { useGame } from '@/contexts/GameContext';

const TestChessScreen = () => {
  const router = useRouter();
  const { createGame, gameState, resetGame } = useGame();

  const handleCreateGame = async () => {
    try {
      const gameId = await createGame(true); // vs AI
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Board Test</Text>

      <View style={styles.buttons}>
        <Button title="Create AI Game" onPress={handleCreateGame} />
        <Button title="Reset Game" onPress={resetGame} color="#ff4444" />
        <Button title="Back to Lobby" onPress={() => router.push('/lobby')} />
      </View>

      {gameState && (
        <View style={styles.boardContainer}>
          <Text style={styles.status}>
            Game Status: {gameState.status} | Turn: {gameState.playerColor}
          </Text>
          <GameChessboard />
        </View>
      )}

      {!gameState && (
        <Text style={styles.noGame}>
          No active game. Create a game to see the board.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2D5016'
  },
  buttons: {
    gap: 10,
    marginBottom: 20
  },
  boardContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center'
  },
  noGame: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666'
  }
});

export default TestChessScreen;
