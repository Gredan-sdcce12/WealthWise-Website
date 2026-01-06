// API client for WealthWise backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Transaction endpoints
  async createTransaction(data) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(userId, filters = {}) {
    const params = new URLSearchParams({
      user_id: userId,
      ...filters,
    });
    return this.request(`/transactions?${params}`);
  }

  async getTransaction(txnId, userId) {
    return this.request(`/transactions/${txnId}?user_id=${userId}`);
  }

  async updateTransaction(txnId, userId, data) {
    return this.request(`/transactions/${txnId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(txnId, userId) {
    return this.request(`/transactions/${txnId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(userId, month, year) {
    const params = new URLSearchParams({
      user_id: userId,
      ...(month && { month }),
      ...(year && { year }),
    });
    return this.request(`/transactions/summary?${params}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
