import { Chess } from 'chess.js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';

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
  game: Chess;
  gameState: GameState | null;
  lastMove: Move | null;
  legalMoves: string[];
  selectedSquare: Square | null;

  assistantHint: AssistantHint | null;
  hintCooldown: number;
  loading: boolean;

  createGame: (vsAI?: boolean) => Promise<string>;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  requestHint: () => Promise<void>;
  selectSquare: (square: Square | null) => void;
  resetGame: () => void;
  loadGame: (gameId: string) => Promise<boolean>;
  addMove: (move: Move) => void;

  socket: Socket | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
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
  const [socket, setSocket] = useState<Socket | null>(null);

  // Legal moves for selected square
  const legalMoves = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map(m => m.to)
    : [];

  // Socket.io connection
  useEffect(() => {
    const s = io('http://localhost:3000', { transports: ['websocket'] });
    setSocket(s);

    // Listen for board reset from server
    s.on('boardReset', (newGameState: GameState) => {
      const newChess = new Chess(newGameState.fen);
      setGame(newChess);
      setGameState(newGameState);
      setLastMove(null);
      setSelectedSquare(null);
      setAssistantHint(null);
      console.log('✅ Board reset received from server');
    });

    return () => s.disconnect();
  }, []);

  // Hint cooldown
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => setHintCooldown(hintCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  const createGame = async (vsAI = false): Promise<string> => {
    setLoading(true);
    try {
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
    try {
      const move = game.move({ from, to, promotion });
      if (!move) return false;

      const newMove: Move = {
        san: move.san,
        from: move.from,
        to: move.to,
        fenAfter: game.fen(),
        timestamp: Date.now()
      };

      setLastMove(newMove);
      setSelectedSquare(null);

      if (gameState) {
        setGameState(prev => prev ? {
          ...prev,
          fen: game.fen(),
          moves: [...prev.moves, newMove],
          status: game.isGameOver() ? 'finished' : prev.status,
          result: game.isCheckmate()
            ? game.turn() === 'w'
              ? '0-1'
              : '1-0'
            : game.isDraw()
              ? '1/2-1/2'
              : undefined
        } : null);
      }

      // AI response simulation
      if (gameState?.opponent === 'AI' && !game.isGameOver()) {
        setTimeout(() => {
          const aiMoves = game.moves();
          if (aiMoves.length > 0) {
            const randomMove = aiMoves[Math.floor(Math.random() * aiMoves.length)];
            const aiMove = game.move(randomMove);
            if (aiMove) {
              const aiGameMove: Move = {
                san: aiMove.san,
                from: aiMove.from,
                to: aiMove.to,
                fenAfter: game.fen(),
                timestamp: Date.now()
              };
              setLastMove(aiGameMove);
              if (gameState) {
                setGameState(prev => prev ? {
                  ...prev,
                  fen: game.fen(),
                  moves: [...prev.moves, aiGameMove],
                  status: game.isGameOver() ? 'finished' : prev.status,
                  result: game.isCheckmate()
                    ? game.turn() === 'w'
                      ? '0-1'
                      : '1-0'
                    : game.isDraw()
                      ? '1/2-1/2'
                      : undefined
                } : null);
              }
            }
          }
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  };

  const requestHint = async (): Promise<void> => {
    if (hintCooldown > 0) return;
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const bestMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
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
          evaluation: (Math.random() - 0.5) * 2
        });
        setHintCooldown(10);
      }
    } catch {
      Alert.alert('Error', 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const selectSquare = (square: Square | null) => setSelectedSquare(square);

  const addMove = (move: Move) => {
    if (!gameState) return;
    setGameState(prev => prev ? { ...prev, moves: [...prev.moves, move] } : null);
  };

  const loadGame = async (gameId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const sampleGame = new Chess();
      sampleGame.move('e4');
      sampleGame.move('e5');
      sampleGame.move('Nf3');
      setGame(sampleGame);
      setGameState({
        id: gameId,
        fen: sampleGame.fen(),
        moves: [
          { san: 'e4', from: 'e2', to: 'e4', fenAfter: sampleGame.fen(), timestamp: Date.now() - 30000 },
          { san: 'e5', from: 'e7', to: 'e5', fenAfter: sampleGame.fen(), timestamp: Date.now() - 20000 },
          { san: 'Nf3', from: 'g1', to: 'f3', fenAfter: sampleGame.fen(), timestamp: Date.now() - 10000 }
        ],
        status: 'active',
        playerColor: 'white',
        opponent: 'AI'
      });
      return true;
    } catch {
      Alert.alert('Error', 'Failed to load game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetGame = (gameId?: string) => {
  const idToReset = gameId ?? gameState?.id;
  if (!idToReset || !socket) return;

  // Émet l’événement resetBoard au backend
  socket.emit('resetBoard', { gameId: idToReset });

  // Réinitialisation locale immédiate pour fluidité UX
  const newGame = new Chess();
  setGame(newGame);
  setGameState(prev => prev ? { ...prev, fen: newGame.fen(), moves: [], status: 'active', result: undefined } : null);
  setLastMove(null);
  setSelectedSquare(null);
  setAssistantHint(null);
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
    socket
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
