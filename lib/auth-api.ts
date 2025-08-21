import { apiClient } from './api';

export interface SendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
  tokens?: AuthResponse;
}

export const authApi = {
  sendOtp: async (dto: SendOtpDto) => {
    return apiClient.post<{ message: string }>('/auth/otp/send', dto);
  },

  verifyOtp: async (dto: VerifyOtpDto) => {
    return apiClient.post<VerifyOtpResponse>('/auth/otp/verify', dto);
  },

  refreshToken: async (dto: RefreshTokenDto) => {
    return apiClient.post<AuthResponse>('/auth/refresh', dto);
  },

  logout: async (dto: RefreshTokenDto) => {
    return apiClient.post<{ message: string }>('/auth/logout', dto);
  }
};
