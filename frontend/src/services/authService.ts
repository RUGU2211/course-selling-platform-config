import { apiService } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from '../types';

class AuthService {
  private readonly BASE_PATH = '/users';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/login`, credentials);
    
    if (response.success && response.data) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/register`, userData);
    
    if (response.success && response.data) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(`${this.BASE_PATH}/logout`);
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(`${this.BASE_PATH}/profile`);
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>(`${this.BASE_PATH}/profile`, userData);
    
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/forgot-password`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/reset-password`, {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/verify-email`, { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/resend-verification`);
  }

  // Utility methods
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getStoredUser();
    return user?.role === requiredRole;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = new AuthService();
export default authService;