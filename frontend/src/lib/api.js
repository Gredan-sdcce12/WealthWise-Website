// API client for WealthWise backend

import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async withAuthHeaders(headers = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token
      ? { Authorization: `Bearer ${token}`, ...headers }
      : headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.withAuthHeaders(options.headers);
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
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

  async getTransactions(filters = {}) {
    const params = new URLSearchParams({
      ...filters,
    });
    return this.request(`/transactions?${params}`);
  }

  async getTransaction(txnId) {
    return this.request(`/transactions/${txnId}`);
  }

  async updateTransaction(txnId, data) {
    return this.request(`/transactions/${txnId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(txnId) {
    return this.request(`/transactions/${txnId}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(month, year) {
    const params = new URLSearchParams({
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

  async getBudgets(filters = {}) {
    const params = new URLSearchParams({
      ...filters,
    });
    return this.request(`/budgets/?${params}`);
  }

  async getBudget(budgetId) {
    return this.request(`/budgets/${budgetId}`);
  }

  async updateBudget(budgetId, data) {
    return this.request(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(budgetId) {
    return this.request(`/budgets/${budgetId}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request('/budgets/categories');
  }

  // Goal endpoints
  async createGoal(data) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGoals() {
    return this.request('/goals');
  }

  async getGoal(goalId) {
    return this.request(`/goals/${goalId}`);
  }

  async updateGoal(goalId, data) {
    return this.request(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  async addSavingsToGoal(goalId, data) {
    return this.request(`/goals/${goalId}/savings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
