import api from './api';

// Types for Expense Management
export interface ExpenseType {
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

export interface ExpenseTransaction {
  _id: string;
  expenseTypeId: string | ExpenseType;
  amount: number;
  date: string;
  uploadedBill?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseTypeData {
  busId: string;
  expenseName: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateExpenseTypeData {
  busId?: string;
  expenseName?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateExpenseTransactionData {
  expenseTypeId: string;
  amount: number;
  date: string;
  uploadedBill?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateExpenseTransactionData {
  expenseTypeId?: string;
  amount?: number;
  date?: string;
  uploadedBill?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  busId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseTransactionQueryParams extends ExpenseQueryParams {
  expenseTypeId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Expense Type Service
export class ExpenseTypeService {
  // Create new expense type
  static async createExpenseType(data: CreateExpenseTypeData): Promise<ExpenseType> {
    const response = await api.post('/expense-types', data);
    return response.data.data;
  }

  // Get all expense types with filtering
  static async getAllExpenseTypes(params?: ExpenseQueryParams): Promise<ExpenseType[]> {
    const response = await api.get('/expense-types', { params });
    return response.data.data;
  }

  // Get expense type by ID
  static async getExpenseTypeById(id: string): Promise<ExpenseType> {
    const response = await api.get(`/expense-types/${id}`);
    return response.data.data;
  }

  // Get expense types by bus ID
  static async getExpenseTypesByBus(busId: string, params?: ExpenseQueryParams): Promise<ExpenseType[]> {
    const response = await api.get(`/expense-types/bus/${busId}`, { params });
    return response.data.data;
  }

  // Update expense type
  static async updateExpenseType(id: string, data: UpdateExpenseTypeData): Promise<ExpenseType> {
    const response = await api.put(`/expense-types/${id}`, data);
    return response.data.data;
  }

  // Delete expense type
  static async deleteExpenseType(id: string): Promise<void> {
    await api.delete(`/expense-types/${id}`);
  }
}

// Expense Transaction Service
export class ExpenseTransactionService {
  // Create new expense transaction
  static async createExpenseTransaction(data: CreateExpenseTransactionData): Promise<ExpenseTransaction> {
    const response = await api.post('/expense-transactions', data);
    return response.data.data;
  }

  // Get all expense transactions with filtering
  static async getAllExpenseTransactions(params?: ExpenseTransactionQueryParams): Promise<ExpenseTransaction[]> {
    const response = await api.get('/expense-transactions', { params });
    return response.data.data;
  }

  // Get expense transaction by ID
  static async getExpenseTransactionById(id: string): Promise<ExpenseTransaction> {
    const response = await api.get(`/expense-transactions/${id}`);
    return response.data.data;
  }

  // Get expense transactions by type
  static async getExpenseTransactionsByType(expenseTypeId: string, params?: ExpenseTransactionQueryParams): Promise<ExpenseTransaction[]> {
    const response = await api.get(`/expense-transactions/type/${expenseTypeId}`, { params });
    return response.data.data;
  }

  // Get expense transactions by date range
  static async getExpenseTransactionsByDateRange(params: { startDate: string; endDate: string } & ExpenseTransactionQueryParams): Promise<ExpenseTransaction[]> {
    const response = await api.get('/expense-transactions/date-range', { params });
    return response.data.data;
  }

  // Update expense transaction
  static async updateExpenseTransaction(id: string, data: UpdateExpenseTransactionData): Promise<ExpenseTransaction> {
    const response = await api.put(`/expense-transactions/${id}`, data);
    return response.data.data;
  }

  // Delete expense transaction
  static async deleteExpenseTransaction(id: string): Promise<void> {
    await api.delete(`/expense-transactions/${id}`);
  }

  // Get expense summary/statistics
  static async getExpenseSummary(params?: {
    busId?: string;
    startDate?: string;
    endDate?: string;
    expenseTypeId?: string;
  }): Promise<{
    totalExpenses: number;
    transactionCount: number;
    averageExpense: number;
    topExpenseTypes: Array<{
      expenseType: ExpenseType;
      totalAmount: number;
      transactionCount: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      totalAmount: number;
      transactionCount: number;
    }>;
  }> {
    const response = await api.get('/expense-transactions/summary', { params });
    return response.data.data;
  }
}
