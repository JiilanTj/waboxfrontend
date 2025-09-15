import { apiClient } from '@/lib/utils/api-client';
import { 
  LoginRequest, 
  LoginResponse, 
  UserProfileResponse, 
  LogoutResponse,
  ApiResponse 
} from '@/lib/types';

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    
    // If login is successful, save the token
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    return apiClient.get<UserProfileResponse>('/me');
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    const response = await apiClient.post<LogoutResponse>('/logout');
    
    // Clear token after logout
    apiClient.setToken(null);
    
    return response;
  },

  /**
   * Check if user is authenticated by validating token
   */
  async checkAuth(): Promise<boolean> {
    const token = apiClient.getToken();
    if (!token) return false;

    const response = await this.getProfile();
    return response.success;
  }
};
