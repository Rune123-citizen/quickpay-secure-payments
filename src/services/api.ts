// Define base URLs for each microservice
const AUTH_SERVICE_URL = 'http://localhost:3001/api';
const USER_SERVICE_URL = 'http://localhost:3002/api';
const TRANSACTION_SERVICE_URL = 'http://localhost:3003/api/v1';
const NOTIFICATION_SERVICE_URL = 'http://localhost:3004/api';
const BALANCE_SERVICE_URL = 'http://localhost:3005/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    kycTier: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  vpa?: string;
  toUserId?: string;
}

export interface Balance {
  userId: string;
  availableBalance: number;
  totalBalance: number;
  currency: string;
  lastUpdated: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error occurred' };
    }
  }

  // Auth Service - Updated endpoints to match NestJS auth service
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    // For now, using OTP-based auth as per the backend implementation
    // First send OTP
    const otpResponse = await this.request<any>(AUTH_SERVICE_URL, '/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: credentials.email }), // Using email as phone for demo
    });

    if (otpResponse.error) {
      return otpResponse;
    }

    // For demo purposes, simulate OTP verification
    // In real implementation, user would enter OTP
    const mockOtp = '123456';
    return this.request<AuthResponse>(AUTH_SERVICE_URL, '/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: credentials.email,
        otp: mockOtp 
      }),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    // Create user via user service first
    const userResponse = await this.request<any>(USER_SERVICE_URL, '/users', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }),
    });

    if (userResponse.error) {
      return userResponse;
    }

    // Then authenticate using phone number
    const otpResponse = await this.request<any>(AUTH_SERVICE_URL, '/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: userData.phoneNumber }),
    });

    if (otpResponse.error) {
      return otpResponse;
    }

    // For demo purposes, simulate OTP verification
    const mockOtp = '123456';
    return this.request<AuthResponse>(AUTH_SERVICE_URL, '/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: userData.phoneNumber,
        otp: mockOtp 
      }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>(AUTH_SERVICE_URL, '/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return result;
  }

  // User Service
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>(USER_SERVICE_URL, '/users/profile');
  }

  // Balance Service
  async getBalance(): Promise<ApiResponse<Balance>> {
    return this.request<Balance>(BALANCE_SERVICE_URL, '/balance');
  }

  async addMoney(amount: number): Promise<ApiResponse<any>> {
    return this.request<any>(BALANCE_SERVICE_URL, '/balance/load', {
      method: 'POST',
      body: JSON.stringify({ 
        amount,
        description: 'Add money to wallet'
      })
    });
  }

  // Transaction Service
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(TRANSACTION_SERVICE_URL, '/transactions');
  }

  async sendMoney(data: {
    amount: number;
    vpa: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(TRANSACTION_SERVICE_URL, '/transactions/upi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async p2pTransfer(data: {
    amount: number;
    toUserId: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(TRANSACTION_SERVICE_URL, '/transactions/p2p', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Notification Service
  async sendOTP(phoneNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>(NOTIFICATION_SERVICE_URL, '/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    });
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    return this.request<any>(NOTIFICATION_SERVICE_URL, '/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp })
    });
  }
}

export const apiService = new ApiService();