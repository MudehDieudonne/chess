import { connectSocket } from '@/services/socket';
import { Chess } from 'chess.js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

export type Square = string;
export type Move = {
  san: string;
  from: string;
  to: string;
  promotion?: string;
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
  turn?: 'w' | 'b';
  isCheckmate?: boolean;
  isDraw?: boolean;
  isCheck?: boolean;
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
  timeLeft: { white: number; black: number };
  isAITurn: boolean;
  isAIThinking: boolean;
  createGame: (vsAI?: boolean) => Promise<string>;
  makeMove: (
    from: Square,
    to: Square,
    promotion?: string
  ) => { from: string; to: string; promotion?: string } | false;
  addMove: (move: Move) => void;
  requestHint: () => Promise<void>;
  selectSquare: (square: Square | null) => void;
  resetGame: () => void;
  loadGame: (gameId: string) => Promise<boolean>;
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
  const { user, getAccessToken } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [assistantHint, setAssistantHint] = useState<AssistantHint | null>(
    null
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ white: 600, black: 600 });
  const [isAITurn, setIsAITurn] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Frontend becomes backend-driven; legal moves not computed locally
  const legalMoves: string[] = [];

  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => setHintCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  useEffect(() => {
    if (!gameState || gameState.status !== 'active' || game.isGameOver()) {
      return;
    }
    const interval = setInterval(() => {
      const turn = game.turn() === 'w' ? 'white' : 'black';
      setTimeLeft(prev => {
        const newTime = prev[turn] - 1;
        if (newTime <= 0) {
          Alert.alert('Time Up', 'Game over due to timeout!');
          setGameState(gs => (gs ? { ...gs, status: 'finished' } : null));
        }
        return { ...prev, [turn]: Math.max(newTime, 0) };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, game]);

  // AI turn detection
  useEffect(() => {
    if (
      gameState?.opponent === 'AI' &&
      gameState.status === 'active' &&
      !game.isGameOver()
    ) {
      const isPlayerTurn =
        (game.turn() === 'w' && gameState.playerColor === 'white') ||
        (game.turn() === 'b' && gameState.playerColor === 'black');

      setIsAITurn(!isPlayerTurn);

      if (!isPlayerTurn && !isAIThinking) {
        // AI's turn to move
        setIsAIThinking(true);
        console.log('AI thinking...');

        // The actual AI move should come from socket event
        // This timeout is just a fallback
        const timeout = setTimeout(() => {
          if (!game.isGameOver()) {
            console.log('AI should make a move via socket');
          }
          setIsAIThinking(false);
        }, 3000);

        return () => clearTimeout(timeout);
      }
    }
  }, [game, gameState, isAIThinking]);

  const updateGameAndState = (move: Move) => {
    console.log('[CTX] updateGameAndState:', {
      from: move.from,
      to: move.to,
      san: move.san,
      fenAfter: move.fenAfter
    });
    try {
      const newGame = new Chess(move.fenAfter);
      setGame(newGame);
      setLastMove(move);
      setGameState(prev => {
        if (!prev) return null;
        const next = {
          ...prev,
          fen: move.fenAfter,
          moves: [...prev.moves, move]
        };
        console.log('[CTX] gameState updated (move):', next.fen);
        return next;
      });
    } catch (e) {
      console.log('[CTX] updateGameAndState invalid FEN:', move.fenAfter, e);
    }
  };

  const applyServerFen = (fen: string, source: string) => {
    console.log('[CTX] applyServerFen from', source, 'fen:', fen);
    try {
      setGame(new Chess(fen));
      setGameState(prev =>
        prev
          ? { ...prev, fen }
          : {
              id: 'unknown',
              fen,
              moves: [],
              status: 'active',
              playerColor: 'white'
            }
      );
    } catch (e) {
      console.log('[CTX] applyServerFen invalid FEN:', fen, e);
    }
  };

  const addMove = (move: Move) => {
    // For AI moves, we need to apply the move to the current game state
    if (move.fenAfter) {
      console.log('[CTX] addMove with fenAfter, applying');
      updateGameAndState(move);
    } else {
      console.log(
        '[CTX] addMove without fenAfter, attempting local derive (deprecated path)'
      );
      // If we don't have the FEN, apply the move to the current game
      const tempGame = new Chess(game.fen());
      const moveResult = tempGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion
      });
      if (moveResult) {
        const updatedMove: Move = {
          ...move,
          fenAfter: tempGame.fen(),
          san: moveResult.san
        };
        updateGameAndState(updatedMove);
      } else {
        console.log('[CTX] addMove local derive failed for', move);
      }
    }
  };

  const connectToSocket = async (gameId: string) => {
    if (!user?.id) {
      throw new Error('User ID is required for socket connection');
    }

    const token = await getAccessToken();

    if (!token) {
      throw new Error('Access token is required for socket connection');
    }

    const socket = connectSocket({
      gameId,
      userId: user.id,
      token: token
    });

    socket.off('aiMoveMade');
    socket.on('aiMoveMade', (data: { move: Move; currentFen?: string }) => {
      const aiMove: Move = {
        from: data.move.from,
        to: data.move.to,
        san: data.move.san,
        fenAfter: data.currentFen ?? game.fen(),
        timestamp: Date.now()
      };
      if (data.currentFen) {
        updateGameAndState(aiMove);
      }
      setIsAITurn(false);
      setIsAIThinking(false);
    });

    // Backend-driven game updates
    socket.off('gameUpdate');
    socket.on(
      'gameUpdate',
      (payload: {
        gameId: string;
        fen: string;
        moves: any[];
        status: string;
      }) => {
        console.log('CTX gameUpdate ->', payload);
        try {
          setGame(new Chess(payload.fen));
        } catch (e) {
          console.log('CTX gameUpdate invalid FEN:', payload.fen, e);
        }
        // Any gameUpdate means AI finished thinking
        setIsAIThinking(false);
        setGameState(prev =>
          prev
            ? {
                ...prev,
                id: String(payload.gameId),
                fen: payload.fen,
                moves: prev.moves,
                status: payload.status === 'ongoing' ? 'active' : prev.status
              }
            : {
                id: String(payload.gameId),
                fen: payload.fen,
                moves: [],
                status: 'active',
                playerColor: 'white'
              }
        );
      }
    );

    socket.on('aiThinking', () => {
      console.log('AI started thinking');
      setIsAIThinking(true);
    });
  };

  const createGame = async (vsAI = false): Promise<string> => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User must be logged in to create a game');
      }

      // Create game via backend API
      const response = await fetch('http://localhost:3000/api/games/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({
          vsAI: vsAI,
          userColor: 'white',
          aiDifficulty: 'medium'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create game on server');
      }

      const gameData = await response.json();
      console.log('Game creation response:', gameData);
      const gameId =
        gameData.data?._id || gameData.data?.id || gameData._id || gameData.id;

      if (!gameId) {
        throw new Error('No game ID returned from server');
      }

      const newGame = new Chess();
      const newGameState: GameState = {
        id: gameId,
        fen: newGame.fen(),
        moves: [],
        status: vsAI ? 'active' : 'waiting',
        playerColor: 'white',
        opponent: vsAI ? 'AI' : undefined,
        turn: 'w',
        isCheckmate: false,
        isDraw: false,
        isCheck: false
      };
      setGame(newGame);
      setGameState(newGameState);
      setLastMove(null);
      setSelectedSquare(null);
      setAssistantHint(null);
      setTimeLeft({ white: 600, black: 600 });
      setIsAITurn(false);
      setIsAIThinking(false);

      if (vsAI) await connectToSocket(gameId);
      return gameId;
    } catch (error) {
      console.error('Game creation error:', error);
      Alert.alert('Error', 'Failed to create game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const makeMove = (
    from: Square,
    to: Square,
    promotion?: string
  ): { from: string; to: string; promotion?: string } | false => {
    // Do not apply locally; trust backend
    if (gameState?.opponent === 'AI') {
      setIsAIThinking(true);
    }
    return { from, to, promotion };
  };

  const requestHint = async (): Promise<void> => {
    if (hintCooldown > 0) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) return;

      const bestMove = moves[Math.floor(Math.random() * moves.length)];
      setAssistantHint({
        move: bestMove.san,
        explanation: 'This is a strong developing move.',
        evaluation: (Math.random() - 0.5) * 2
      });
      setHintCooldown(10);
    } catch {
      Alert.alert('Error', 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const selectSquare = (square: Square | null) => setSelectedSquare(square);

  const resetGame = () => {
    setGame(new Chess());
    setGameState(null);
    setLastMove(null);
    setSelectedSquare(null);
    setAssistantHint(null);
    setTimeLeft({ white: 600, black: 600 });
    setIsAITurn(false);
    setIsAIThinking(false);
  };

  const loadGame = async (gameId: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User must be logged in to load a game');
      }

      // Initialize minimal state; backend will drive updates
      setGame(new Chess());
      setGameState(
        prev =>
          prev ?? {
            id: gameId,
            fen: new Chess().fen(),
            moves: [],
            status: 'active',
            playerColor: 'white',
            opponent: 'AI'
          }
      );

      setLastMove(null);
      setSelectedSquare(null);
      setTimeLeft({ white: 600, black: 600 });
      setIsAITurn(false);
      setIsAIThinking(false);

      await connectToSocket(gameId);
      return true;
    } catch (error) {
      console.error('Game load error:', error);
      Alert.alert('Error', 'Failed to load game');
      return false;
    } finally {
      setLoading(false);
    }
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
    timeLeft,
    isAITurn,
    isAIThinking,
    createGame,
    makeMove,
    addMove,
    requestHint,
    selectSquare,
    resetGame,
    loadGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
