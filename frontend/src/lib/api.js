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
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // Re-throw with better message for network errors
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
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

  // Budget endpoints
  async createBudget(data) {
    return this.request('/budgets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBudgets(userId, filters = {}) {
    const params = new URLSearchParams({
      user_id: userId,
      ...filters,
    });
    return this.request(`/budgets/?${params}`);
  }

  async getBudget(budgetId, userId) {
    return this.request(`/budgets/${budgetId}?user_id=${userId}`);
  }

  async updateBudget(budgetId, userId, data) {
    return this.request(`/budgets/${budgetId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(budgetId, userId) {
    return this.request(`/budgets/${budgetId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async getCategories(userId) {
    return this.request(`/budgets/categories?user_id=${userId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
