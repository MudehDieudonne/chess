import { apiClient } from './api';

export interface StartGameDto {
  vsAI?: boolean;
  opponentId?: string;
}

export interface MakeMoveDto {
  from: string;
  to: string;
  promotion?: string;
}

export const gameApi = {
  startGame: async (dto: StartGameDto) => {
    return apiClient.post<{ gameId: string; fen: string }>('/games/start', dto);
  },

  makeMove: async (gameId: string, dto: MakeMoveDto) => {
    return apiClient.post<{ success: boolean; fen: string }>(
      `/games/${gameId}/move`,
      dto
    );
  },

  getGame: async (gameId: string) => {
    return apiClient.get<{
      id: string;
      fen: string;
      moves: any[];
      status: string;
      players: any[];
    }>(`/games/${gameId}`);
  },

  endGame: async (gameId: string) => {
    return apiClient.post<{ message: string }>(`/games/${gameId}/end`, {});
  }
};
