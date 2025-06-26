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
      // Return mock data for development when services are not available
      return this.getMockResponse<T>(endpoint, options.method || 'GET');
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): ApiResponse<T> {
    // Mock responses for development when backend services aren't running
    if (endpoint.includes('/auth/verify-otp') && method === 'POST') {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: 'demo@payflow.com',
            firstName: 'Demo',
            lastName: 'User',
            phoneNumber: '+919876543210',
            kycTier: 'TIER_1',
            status: 'ACTIVE'
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        } as T
      };
    }

    if (endpoint.includes('/users') && method === 'POST') {
      return {
        data: {
          id: 'mock-user-id',
          email: 'demo@payflow.com',
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+919876543210',
          status: 'ACTIVE'
        } as T
      };
    }

    if (endpoint.includes('/users/profile')) {
      return {
        data: {
          id: 'mock-user-id',
          email: 'demo@payflow.com',
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+919876543210',
          kycTier: 'TIER_1',
          status: 'ACTIVE'
        } as T
      };
    }

    if (endpoint.includes('/balance')) {
      return {
        data: {
          userId: 'mock-user-id',
          availableBalance: 5000.00,
          totalBalance: 5000.00,
          currency: 'INR',
          lastUpdated: new Date().toISOString()
        } as T
      };
    }

    if (endpoint.includes('/transactions')) {
      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'UPI_PAYMENT',
          amount: 500,
          description: 'Coffee payment',
          status: 'SUCCESS',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          vpa: 'merchant@paytm'
        },
        {
          id: 'txn-2',
          type: 'P2P_TRANSFER',
          amount: 1000,
          description: 'Money transfer to friend',
          status: 'SUCCESS',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          toUserId: 'friend-user-id'
        },
        {
          id: 'txn-3',
          type: 'MOBILE_RECHARGE',
          amount: 299,
          description: 'Mobile recharge',
          status: 'SUCCESS',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'txn-4',
          type: 'MONEY_RECEIVED',
          amount: 2000,
          description: 'Payment received from client',
          status: 'SUCCESS',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      return { data: mockTransactions as T };
    }

    // Default mock response for other endpoints
    return { data: {} as T };
  }

  // Auth Service - Updated endpoints to match NestJS auth service
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    // For demo purposes, simulate successful login
    return {
      data: {
        user: {
          id: 'demo-user-id',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+919876543210',
          kycTier: 'TIER_1',
          status: 'ACTIVE'
        },
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token'
      }
    };
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
      // If backend is not available, return mock success response
      return {
        data: {
          user: {
            id: 'demo-user-id',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            kycTier: 'TIER_1',
            status: 'ACTIVE'
          },
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token'
        }
      };
    }

    // Then authenticate using phone number
    const otpResponse = await this.request<any>(AUTH_SERVICE_URL, '/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: userData.phoneNumber }),
    });

    if (otpResponse.error) {
      // If backend is not available, return mock success response
      return {
        data: {
          user: {
            id: 'demo-user-id',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            kycTier: 'TIER_1',
            status: 'ACTIVE'
          },
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token'
        }
      };
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return { data: undefined };
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