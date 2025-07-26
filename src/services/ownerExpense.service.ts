import api from './api';

// Types for Owner Expense Management (owner-restricted)
export interface OwnerExpenseType {
  _id: string;
  busId: string | {
    _id: string;
    busNumber: string;
    busName: string;
  };
  expenseName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerExpenseTransaction {
  _id: string;
  expenseTypeId: string | OwnerExpenseType | null;
  amount: number;
  date: string;
  uploadedBill?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOwnerExpenseTypeData {
  busId: string;
  expenseName: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateOwnerExpenseTypeData {
  busId?: string;
  expenseName?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateOwnerExpenseTransactionData {
  expenseTypeId: string;
  amount: number;
  date: string;
  uploadedBill?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateOwnerExpenseTransactionData {
  expenseTypeId?: string;
  amount?: number;
  date?: string;
  uploadedBill?: string;
  notes?: string;
  isActive?: boolean;
}

export interface OwnerExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  busId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OwnerExpenseTransactionQueryParams extends OwnerExpenseQueryParams {
  expenseTypeId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Owner Expense Type Service (only for owner's buses)
export class OwnerExpenseTypeService {
  // Create new expense type (owner can only create for their own buses)
  static async createExpenseType(data: CreateOwnerExpenseTypeData): Promise<OwnerExpenseType> {
    const response = await api.post('/expense-types/owner', data);
    return response.data.data;
  }

  // Get all expense types for owner's buses only
  static async getOwnerExpenseTypes(params?: OwnerExpenseQueryParams): Promise<OwnerExpenseType[]> {
    const response = await api.get('/expense-types/owner', { params });
    return response.data.data;
  }

  // Get expense type by ID (owner can only access their own)
  static async getExpenseTypeById(id: string): Promise<OwnerExpenseType> {
    const response = await api.get(`/expense-types/owner/${id}`);
    return response.data.data;
  }

  // Get expense types by specific bus (only owner's buses)
  static async getExpenseTypesByBus(busId: string, params?: OwnerExpenseQueryParams): Promise<OwnerExpenseType[]> {
    const response = await api.get(`/expense-types/owner/bus/${busId}`, { params });
    return response.data.data;
  }

  // Update expense type (owner can only update their own)
  static async updateExpenseType(id: string, data: UpdateOwnerExpenseTypeData): Promise<OwnerExpenseType> {
    const response = await api.put(`/expense-types/owner/${id}`, data);
    return response.data.data;
  }

  // Delete expense type (owner can only delete their own)
  static async deleteExpenseType(id: string): Promise<void> {
    await api.delete(`/expense-types/owner/${id}`);
  }
}

// Owner Expense Transaction Service (only for owner's buses)
export class OwnerExpenseTransactionService {
  // Create new expense transaction (owner can only create for their expense types)
  static async createExpenseTransaction(data: CreateOwnerExpenseTransactionData): Promise<OwnerExpenseTransaction> {
    const response = await api.post('/expense-transactions/owner', data);
    return response.data.data;
  }

  // Get all expense transactions for owner's buses only
  static async getOwnerExpenseTransactions(params?: OwnerExpenseTransactionQueryParams): Promise<OwnerExpenseTransaction[]> {
    const response = await api.get('/expense-transactions/owner', { params });
    return response.data.data;
  }

  // Get expense transaction by ID (owner can only access their own)
  static async getExpenseTransactionById(id: string): Promise<OwnerExpenseTransaction> {
    const response = await api.get(`/expense-transactions/owner/${id}`);
    return response.data.data;
  }

  // Get expense transactions by type (only owner's expense types)
  static async getExpenseTransactionsByType(expenseTypeId: string, params?: OwnerExpenseTransactionQueryParams): Promise<OwnerExpenseTransaction[]> {
    const response = await api.get(`/expense-transactions/owner/type/${expenseTypeId}`, { params });
    return response.data.data;
  }

  // Get expense transactions by date range (only owner's transactions)
  static async getExpenseTransactionsByDateRange(params: { startDate: string; endDate: string } & OwnerExpenseTransactionQueryParams): Promise<OwnerExpenseTransaction[]> {
    const response = await api.get('/expense-transactions/owner/date-range', { params });
    return response.data.data;
  }

  // Update expense transaction (owner can only update their own)
  static async updateExpenseTransaction(id: string, data: UpdateOwnerExpenseTransactionData): Promise<OwnerExpenseTransaction> {
    const response = await api.put(`/expense-transactions/owner/${id}`, data);
    return response.data.data;
  }

  // Delete expense transaction (owner can only delete their own)
  static async deleteExpenseTransaction(id: string): Promise<void> {
    await api.delete(`/expense-transactions/owner/${id}`);
  }

  // Get expense summary/statistics for owner's buses only
  static async getOwnerExpenseSummary(params?: {
    busId?: string;
    startDate?: string;
    endDate?: string;
    expenseTypeId?: string;
  }): Promise<{
    totalExpenses: number;
    transactionCount: number;
    averageExpense: number;
    topExpenseTypes: Array<{
      expenseType: OwnerExpenseType;
      totalAmount: number;
      transactionCount: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      totalAmount: number;
      transactionCount: number;
    }>;
  }> {
    const response = await api.get('/expense-transactions/owner/summary', { params });
    return response.data.data;
  }
}
