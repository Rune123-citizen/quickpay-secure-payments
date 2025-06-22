
const API_BASE_URL = 'http://localhost:8080/api'; // API Gateway URL

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
      return { error: 'Network error occurred' };
    }
  }

  // Auth Service
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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

  // Balance Service
  async getBalance(): Promise<ApiResponse<Balance>> {
    return this.request<Balance>('/balance');
  }

  async addMoney(amount: number): Promise<ApiResponse<any>> {
    return this.request<any>('/balance/load', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Transaction Service
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>('/transactions');
  }

  async sendMoney(data: {
    amount: number;
    vpa: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions/upi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async p2pTransfer(data: {
    amount: number;
    toUserId: string;
    description: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions/p2p', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notification Service
  async sendOTP(phoneNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }
}

export const apiService = new ApiService();
