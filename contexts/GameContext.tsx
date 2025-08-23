import { Chess } from 'chess.js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { Alert } from 'react-native';

// Types
export type Square = string;
export type Move = {
  san: string;
  from: string;
  to: string;
  fenAfter: string;
  timestamp: number;
};

interface GameState {
  id: string;
  fen: string;
  moves: Move[];
  status: 'waiting' | 'active' | 'finished';
  result?: '1-0' | '0-1' | '1/2-1/2';
  playerColor: 'white' | 'black';
  opponent?: string;
  timeLeft?: { white: number; black: number };
}

interface AssistantHint {
  move: string;
  explanation: string;
  evaluation: number;
}

interface GameContextType {
  // Core game state
  game: Chess;
  gameState: GameState | null;
  lastMove: Move | null;
  legalMoves: string[];
  selectedSquare: Square | null;

  // Assistant features
  assistantHint: AssistantHint | null;
  hintCooldown: number;
  loading: boolean;

  // Game actions
  createGame: (vsAI?: boolean) => Promise<string>;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  requestHint: () => Promise<void>;
  selectSquare: (square: Square | null) => void;
  resetGame: () => void;
  loadGame: (gameId: string) => Promise<boolean>;

  // Additional utilities
  addMove: (move: Move) => void;
  undoMove: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [assistantHint, setAssistantHint] = useState<AssistantHint | null>(
    null
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate legal moves for selected square
  const legalMoves = selectedSquare
  ? game.moves({ square: selectedSquare as any, verbose: true }).map((move: any) => move.to)
  : [];

  // Hint cooldown timer
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => setHintCooldown(hintCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  const createGame = async (vsAI = false): Promise<string> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newGame = new Chess();
      const gameId = 'game_' + Date.now();

      const newGameState: GameState = {
        id: gameId,
        fen: newGame.fen(),
        moves: [],
        status: vsAI ? 'active' : 'waiting',
        playerColor: 'white',
        opponent: vsAI ? 'AI' : undefined
      };

      setGame(newGame);
      setGameState(newGameState);
      setLastMove(null);
      setSelectedSquare(null);
      setAssistantHint(null);

      Alert.alert(
        'Game Created',
        vsAI ? 'Playing against AI' : 'Waiting for opponent...'
      );

      return gameId;
    } catch (error) {
      Alert.alert('Error', 'Failed to create game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const makeMove = (from: Square, to: Square, promotion?: string): boolean => {
    const newGame = new Chess(game.fen()); // clone current game
    const move = newGame.move({ from, to, promotion });

    if (!move) return false;

    const newMove: Move = {
      san: move.san,
      from: move.from,
      to: move.to,
      fenAfter: newGame.fen(),
      timestamp: Date.now(),
    };

    setGame(newGame); // replace with new instance
    setLastMove(newMove);
    setSelectedSquare(null);

    if (gameState) {
      setGameState({
        ...gameState,
        fen: newGame.fen(),
        moves: [...gameState.moves, newMove],
        status: newGame.isGameOver() ? 'finished' : gameState.status,
        result: newGame.isCheckmate()
          ? newGame.turn() === 'w' ? '0-1' : '1-0'
          : newGame.isDraw()
          ? '1/2-1/2'
          : undefined,
      });
    }

    // --- AI move simulation ---
    if (gameState?.opponent === 'AI' && !newGame.isGameOver()) {
      setTimeout(() => {
        const aiGame = new Chess(newGame.fen()); // clone again
        const aiMoves = aiGame.moves();
        if (aiMoves.length > 0) {
          const randomMove = aiMoves[Math.floor(Math.random() * aiMoves.length)];
          const aiMove = aiGame.move(randomMove);

          if (aiMove) {
            const aiGameMove: Move = {
              san: aiMove.san,
              from: aiMove.from,
              to: aiMove.to,
              fenAfter: aiGame.fen(),
              timestamp: Date.now(),
            };

            setGame(aiGame); // replace instance
            setLastMove(aiGameMove);
            setGameState(prev =>
              prev
                ? {
                    ...prev,
                    fen: aiGame.fen(),
                    moves: [...prev.moves, aiGameMove],
                    status: aiGame.isGameOver() ? 'finished' : prev.status,
                    result: aiGame.isCheckmate()
                      ? aiGame.turn() === 'w'
                        ? '0-1'
                        : '1-0'
                      : aiGame.isDraw()
                      ? '1/2-1/2'
                      : undefined,
                  }
                : null
            );
          }
        }
      }, 1000);
    }

    return true;
  };

  const addMove = (move: Move) => {
    if (gameState) {
      setGameState({
        ...gameState,
        moves: [...gameState.moves, move]
      });
    }
  };

  const requestHint = async (): Promise<void> => {
    if (hintCooldown > 0) return;

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const bestMove =
          moves[Math.floor(Math.random() * Math.min(3, moves.length))];
        const hints = [
          'Controls the center and opens diagonals for development.',
          'Develops a piece while controlling key squares.',
          'Improves piece coordination and prepares for castling.',
          'Creates tactical opportunities and improves position.',
          'Strengthens the position and prepares for the middlegame.'
        ];

        setAssistantHint({
          move: bestMove.san,
          explanation: hints[Math.floor(Math.random() * hints.length)],
          evaluation: (Math.random() - 0.5) * 2 // Random evaluation between -1 and 1
        });

        setHintCooldown(10); // 10 second cooldown
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const selectSquare = (square: Square | null) => {
    setSelectedSquare(square);
  };

  const loadGame = async (gameId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate loading game from API
      await new Promise(resolve => setTimeout(resolve, 500));

      // For demo, create a sample game
      const sampleGame = new Chess();
      sampleGame.move('e4');
      sampleGame.move('e5');
      sampleGame.move('Nf3');

      setGame(sampleGame);
      setGameState({
        id: gameId,
        fen: sampleGame.fen(),
        moves: [
          {
            san: 'e4',
            from: 'e2',
            to: 'e4',
            fenAfter:
              'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            timestamp: Date.now() - 30000
          },
          {
            san: 'e5',
            from: 'e7',
            to: 'e5',
            fenAfter:
              'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
            timestamp: Date.now() - 20000
          },
          {
            san: 'Nf3',
            from: 'g1',
            to: 'f3',
            fenAfter: sampleGame.fen(),
            timestamp: Date.now() - 10000
          }
        ],
        status: 'active',
        playerColor: 'white',
        opponent: 'AI'
      });

      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to load game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const undoMove = () => {
    console.log('undoMove called');
    console.log('gameState:', gameState);
    console.log('gameState.moves.length:', gameState?.moves.length);

    if (!gameState || gameState.moves.length === 0) {
      console.log('Cannot undo: no moves to undo');
      return;
    }

    const newGame = new Chess(); // fresh game
    const movesToReplay = [...gameState.moves];
    movesToReplay.pop(); // drop last move

    console.log('Moves to replay:', movesToReplay.length);

    // Replay all remaining moves using the SAN notation
    movesToReplay.forEach((move, index) => {
      try {
        console.log(`Replaying move ${index + 1}: ${move.san}`);
        newGame.move(move.san);
      } catch (error) {
        console.error('Failed to replay move:', move.san, error);
        // Fallback to from/to notation
        try {
          newGame.move({ from: move.from, to: move.to });
        } catch (fallbackError) {
          console.error('Fallback move also failed:', fallbackError);
        }
      }
    });

    console.log('New FEN after undo:', newGame.fen());

    setGame(newGame);
    setGameState({
      ...gameState,
      fen: newGame.fen(),
      moves: movesToReplay,
      status: newGame.isGameOver() ? 'finished' : 'active',
      result: newGame.isCheckmate()
        ? newGame.turn() === 'w' ? '0-1' : '1-0'
        : newGame.isDraw()
        ? '1/2-1/2'
        : undefined,
    });
    setLastMove(movesToReplay[movesToReplay.length - 1] || null);
    setSelectedSquare(null);
    setAssistantHint(null);

    console.log('Undo completed');
  };

  const resetGame = () => {
    console.log('resetGame called');
    
    const newGame = new Chess();
    const initialGameState: GameState = {
      id: 'game_' + Date.now(),
      fen: newGame.fen(),
      moves: [],
      status: 'active',
      playerColor: 'white',
      opponent: gameState?.opponent || 'AI',
    };

    console.log('Resetting to initial state');

    setGame(newGame);
    setGameState(initialGameState);
    setLastMove(null);
    setSelectedSquare(null);
    setAssistantHint(null);
    setHintCooldown(0);

    console.log('Reset completed');
  };

  const value: GameContextType = {
    game,
    gameState,
    lastMove,
    legalMoves,
    selectedSquare,
    assistantHint,
    hintCooldown,
    loading,
    createGame,
    makeMove,
    requestHint,
    selectSquare,
    resetGame,
    loadGame,
    addMove,
    undoMove
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};