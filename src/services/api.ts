const API_BASE_URL = 'http://localhost:3001/api'; // Auth service URL

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    const otpResponse = await this.request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: credentials.email }), // Using email as phone for demo
    });

    if (otpResponse.error) {
      return otpResponse;
    }

    // For demo purposes, simulate OTP verification
    // In real implementation, user would enter OTP
    const mockOtp = '123456';
    return this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: credentials.email,
        otp: mockOtp 
      }),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    // Create user via user service first
    const userResponse = await this.request<any>('/users', {
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
    const otpResponse = await this.request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: userData.phoneNumber }),
    });

    if (otpResponse.error) {
      return otpResponse;
    }

    // For demo purposes, simulate OTP verification
    const mockOtp = '123456';
    return this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: userData.phoneNumber,
        otp: mockOtp 
      }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return result;
  }

  // User Service
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/profile');
  }

  // Balance Service - Different port
  async getBalance(): Promise<ApiResponse<Balance>> {
    return fetch('http://localhost:3005/api/v1/balance', {
      headers: { ...this.getAuthHeaders() }
    }).then(res => res.json()).catch(() => ({ error: 'Balance service unavailable' }));
  }

  async addMoney(amount: number): Promise<ApiResponse<any>> {
    return fetch('http://localhost:3005/api/v1/balance/load', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...this.getAuthHeaders() 
      },
      body: JSON.stringify({ amount })
    }).then(res => res.json()).catch(() => ({ error: 'Balance service unavailable' }));
  }

  // Transaction Service - Different port
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return fetch('http://localhost:3003/api/v1/transactions', {
      headers: { ...this.getAuthHeaders() }
    }).then(res => res.json()).catch(() => ({ error: 'Transaction service unavailable' }));
  }

  async sendMoney(data: {
    amount: number;
    vpa: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return fetch('http://localhost:3003/api/v1/transactions/upi', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...this.getAuthHeaders() 
      },
      body: JSON.stringify(data)
    }).then(res => res.json()).catch(() => ({ error: 'Transaction service unavailable' }));
  }

  async p2pTransfer(data: {
    amount: number;
    toUserId: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return fetch('http://localhost:3003/api/v1/transactions/p2p', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...this.getAuthHeaders() 
      },
      body: JSON.stringify(data)
    }).then(res => res.json()).catch(() => ({ error: 'Transaction service unavailable' }));
  }

  // Notification Service
  async sendOTP(phoneNumber: string): Promise<ApiResponse<any>> {
    return fetch('http://localhost:3004/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    }).then(res => res.json()).catch(() => ({ error: 'Notification service unavailable' }));
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    return fetch('http://localhost:3004/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp })
    }).then(res => res.json()).catch(() => ({ error: 'Notification service unavailable' }));
  }
}

export const apiService = new ApiService();
