export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface UserProfileResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}
