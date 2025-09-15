import { User } from './auth';

export interface UsersPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersListResponse {
  users: User[];
  pagination: UsersPagination;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export interface DeleteUserResponse {
  message: string;
}
