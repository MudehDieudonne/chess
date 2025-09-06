import { connectSocket } from '@/services/socket';
import { Chess } from 'chess.js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

declare global {
  interface Window {
    __currentSocketGameId?: string;
  }
}

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
  lastAnimatedMove: Move | null;
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
  addMove: (move: Move) => Move | null;
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
  const [lastAnimatedMove, setLastAnimatedMove] = useState<Move | null>(null);

  // Store socket reference
  const socketRef = useRef<any>(null);
  const pendingAIMove = useRef<Move | null>(null);

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
        setIsAIThinking(true);
        console.log('AI thinking...');

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

  const updateGameAndState = (move: Move): Move | null => {
    console.log('[CTX] updateGameAndState:', {
      from: move.from,
      to: move.to,
      san: move.san
    });
    console.log('[CTX] before apply: game.fen()', game.fen());

    try {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion
      });

      if (moveResult) {
        setGame(newGame);
        setLastMove(move);
        setLastAnimatedMove(move);

        setGameState(prev => {
          if (!prev) return null;
          const next = {
            ...prev,
            fen: newGame.fen(),
            moves: [...prev.moves, move],
            turn: newGame.turn(),
            isCheck: newGame.isCheck(),
            isCheckmate: newGame.isCheckmate(),
            isDraw: newGame.isDraw()
          };
          console.log('[CTX] gameState updated (move):', next.fen);
          return next;
        });
        console.log('[CTX] after apply: newGame.fen()', newGame.fen());
        return move;
      } else {
        console.log('[CTX] Invalid move attempted:', move);
        return null;
      }
    } catch (e) {
      console.log('[CTX] updateGameAndState error:', e);
      return null;
    }
  };

  const applyServerFen = (fen: string, source: string) => {
    console.log('[CTX] applyServerFen from', source, 'fen:', fen);
    try {
      const newGame = new Chess(fen);
      setGame(newGame);

      setGameState(prev =>
        prev
          ? {
              ...prev,
              fen,
              turn: newGame.turn(),
              isCheck: newGame.isCheck(),
              isCheckmate: newGame.isCheckmate(),
              isDraw: newGame.isDraw()
            }
          : {
              id: 'unknown',
              fen,
              moves: [],
              status: 'active',
              playerColor: 'white',
              turn: newGame.turn(),
              isCheck: newGame.isCheck(),
              isCheckmate: newGame.isCheckmate(),
              isDraw: newGame.isDraw()
            }
      );
    } catch (e) {
      console.log('[CTX] applyServerFen invalid FEN:', fen, e);
    }
  };

  const addMove = (move: Move): Move | null => {
    console.log('[CTX] addMove called with:', move);

    if (move.fenAfter && move.fenAfter !== game.fen()) {
      console.log(
        '[CTX] FEN mismatch! Using move FEN instead of current game state'
      );
      console.log('[CTX] Current game FEN:', game.fen());
      console.log('[CTX] Move FEN:', move.fenAfter);

      pendingAIMove.current = move;
      applyServerFen(move.fenAfter, 'addMove-fallback');
      setLastAnimatedMove(move);
      return move;
    }

    if (move.fenAfter) {
      console.log('[CTX] addMove with fenAfter, applying');
      return updateGameAndState(move);
    } else {
      console.log('[CTX] addMove without fenAfter, attempting local derive');
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
        return updateGameAndState(updatedMove);
      } else {
        console.log('[CTX] addMove local derive failed for', move);
        return null;
      }
    }
  };

  const connectToSocket = async (gameId: string) => {
    console.log('[CTX] connectToSocket called for game:', gameId);

    if (window.__currentSocketGameId === gameId) {
      console.log('[CTX] Already connected to this game, skipping');
      return socketRef.current;
    }

    window.__currentSocketGameId = gameId;

    if (!user?.id) throw new Error('User ID is required for socket connection');

    const token = await getAccessToken();
    if (!token)
      throw new Error('Access token is required for socket connection');

    const socket = connectSocket({ gameId, userId: user.id, token });
    socketRef.current = socket;

    socket.off('aiMoveMade');
    socket.on('aiMoveMade', (data: { move: Move; currentFen?: string }) => {
      console.log('[CTX] aiMoveMade received:', data);

      if (data.currentFen) {
        console.log('[CTX] Using FEN from aiMoveMade:', data.currentFen);
        const aiMove: Move = {
          from: data.move.from,
          to: data.move.to,
          san: data.move.san,
          fenAfter: data.currentFen,
          timestamp: Date.now(),
          promotion: data.move.promotion
        };

        pendingAIMove.current = aiMove;
        applyServerFen(data.currentFen, 'aiMoveMade');
        setLastAnimatedMove(aiMove);
      } else {
        console.log(
          '[CTX] No FEN provided with AI move, using current game state'
        );
        const aiMove: Move = {
          from: data.move.from,
          to: data.move.to,
          san: data.move.san,
          fenAfter: game.fen(),
          timestamp: Date.now(),
          promotion: data.move.promotion
        };
        addMove(aiMove);
      }

      setIsAITurn(false);
      setIsAIThinking(false);
    });

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
        applyServerFen(payload.fen, 'gameUpdate');
        setIsAIThinking(false);
      }
    );

    socket.on('aiThinking', () => {
      console.log('AI started thinking');
      setIsAIThinking(true);
    });

    return socket;
  };

  const createGame = async (vsAI = false): Promise<string> => {
    setLoading(true);
    try {
      if (!user?.id) throw new Error('User must be logged in to create a game');

      // Use relative URL or environment variable
      const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE}/games/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({
          vsAI,
          userColor: 'white',
          aiDifficulty: 'medium'
        })
      });

      if (!response.ok) throw new Error('Failed to create game on server');

      const gameData = await response.json();
      console.log('Game creation response:', gameData);
      const gameId =
        gameData.data?._id || gameData.data?.id || gameData._id || gameData.id;
      if (!gameId) throw new Error('No game ID returned from server');

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

  const makeMove = (from: Square, to: Square, promotion?: string) => {
    if (gameState?.opponent === 'AI') setIsAIThinking(true);

    // Emit move to server through socket
    if (socketRef.current && gameState?.id) {
      console.log('[CTX] Emitting makeMove to server:', {
        from,
        to,
        promotion
      });

      // FIX: Match backend expectation - use "dto" instead of "move"
      socketRef.current.emit('makeMove', {
        gameId: gameState.id,
        dto: {
          // Changed from "move" to "dto"
          from: from,
          to: to,
          promotion: promotion
        }
      });
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
    const newGame = new Chess();
    setGame(newGame);
    setGameState(prev =>
      prev
        ? {
            ...prev,
            fen: newGame.fen(),
            moves: [],
            status: 'active',
            result: undefined
          }
        : null
    );
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
      if (!user?.id) throw new Error('User must be logged in to load a game');

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
    lastAnimatedMove,
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
