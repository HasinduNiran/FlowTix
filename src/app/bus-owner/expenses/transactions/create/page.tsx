'use client';

import ExpenseTransactionForm from '@/components/dashboard/expenses/ExpenseTransactionForm';

export default function CreateExpenseTransactionPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Expense Transaction
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new expense transaction for your bus operations
          </p>
        </div>
        
        <ExpenseTransactionForm />
      </div>
    </div>
  );
}
