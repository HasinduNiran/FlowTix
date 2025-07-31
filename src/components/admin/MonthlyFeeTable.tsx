'use client';

import React from 'react';
import { MonthlyFee } from '@/services/monthlyFee.service';

interface MonthlyFeeTableProps {
  monthlyFees: MonthlyFee[];
  loading: boolean;
  onEdit: (monthlyFee: MonthlyFee) => void;
  onDelete: (monthlyFee: MonthlyFee) => void;
  onMarkPaid: (monthlyFee: MonthlyFee) => void;
  onGenerateBill: (monthlyFee: MonthlyFee) => void;
}

const MonthlyFeeTable: React.FC<MonthlyFeeTableProps> = ({
  monthlyFees,
  loading,
  onEdit,
  onDelete,
  onMarkPaid,
  onGenerateBill
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string, amount: number, paidAmount: number) => {
    let statusColor = '';
    let statusText = '';
    
    if (status === 'paid') {
      statusColor = 'bg-green-100 text-green-800';
      statusText = 'Paid';
    } else if (status === 'partial') {
      statusColor = 'bg-yellow-100 text-yellow-800';
      statusText = 'Partial';
    } else {
      statusColor = 'bg-red-100 text-red-800';
      statusText = 'Unpaid';
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
        {statusText}
      </span>
    );
  };

  const getBalanceAmount = (amount: number, paidAmount: number) => {
    const balance = amount - paidAmount;
    return balance;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monthly fees...</p>
        </div>
      </div>
    );
  }

  if (monthlyFees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600">No monthly fees found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bus & Month
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment Date
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyFees.map((fee) => (
              <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fee.busId.busNumber} - {fee.busId.busName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatMonth(fee.month)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {fee.ownerId.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(fee.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(fee.paidAmount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-medium ${
                    getBalanceAmount(fee.amount, fee.paidAmount) > 0 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formatCurrency(getBalanceAmount(fee.amount, fee.paidAmount))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(fee.status, fee.amount, fee.paidAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {fee.paymentDate ? formatDate(fee.paymentDate) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit(fee)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                      title="Edit monthly fee"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => onMarkPaid(fee)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
                        title="Mark as paid"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => onGenerateBill(fee)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
                      title="Generate bill"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onDelete(fee)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                      title="Delete monthly fee"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3l1.586-1.586a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8 9V6a1 1 0 011-1z" clipRule="evenodd" />
                        <path d="M14 17a1 1 0 01-1 1H7a1 1 0 01-1-1v-9h8v9z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyFeeTable;
