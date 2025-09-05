import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

interface ConnectOptions {
  gameId: string;
  userId: string;
  token?: string;
}

export const connectSocket = ({ gameId, userId, token }: ConnectOptions) => {
  // If socket already exists and is connected to same game, return it
  if (socket && socket.connected && socket.auth?.gameId === gameId) {
    console.log('Reusing existing socket connection for game:', gameId);
    return socket;
  }

  // Disconnect existing socket if it's for a different game
  if (socket) {
    console.log('Disconnecting previous socket for game:', socket.auth?.gameId);
    socket.disconnect();
    socket = null;
  }

  if (!token) {
    throw new Error('Access token is required for socket connection');
  }

  socket = io('http://localhost:3000', {
    auth: { token, userId, gameId },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server for game:', gameId);
  });

  socket.on('disconnect', reason => {
    console.log('Disconnected from game', gameId, 'reason:', reason);
  });

  socket.on('connect_error', err => {
    console.error('Socket connection error for game', gameId, ':', err);
  });

  socket.on('error', error => {
    console.error('Socket error for game', gameId, ':', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not connected');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Closing socket connection for game:', socket.auth?.gameId);
    socket.disconnect();
    socket = null;
    console.log('Socket connection closed');
  }
};

// Start a game vs AI
export const startGame = (dto: any) => {
  getSocket().emit('startGame', dto);
};

// Make a move
export const makeMove = (gameId: string, dto: any) => {
  getSocket().emit('makeMove', { gameId, dto });
};

// End a game
export const endGame = (data: {
  gameId: string;
  reason: string;
  winner: string;
}) => {
  getSocket().emit('endGame', data);
};

// Reset board
export const resetBoard = (gameId: string) => {
  getSocket().emit('resetBoard', { gameId });
};
