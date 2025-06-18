import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week'); // Default to week view
  
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (filter === 'week') {
        return transactionDate >= oneWeekAgo;
      } else if (filter === 'month') {
        return transactionDate >= oneMonthAgo;
      }
      return true; // 'all' filter
    });
  }, [transactions, filter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transaksi Terakhir</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('week')} 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'week' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Seminggu
          </button>
          <button 
            onClick={() => setFilter('month')} 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'month' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Sebulan
          </button>
        </div>
      </div>
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-medium text-gray-800">
                    {transaction.type === 'deposit' ? 'Menabung' : 'Penarikan'}
                  </span>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
                <span className={transaction.type === 'deposit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
              {transaction.description && (
                <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Deskripsi:</span> {transaction.description}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          {transactions.length > 0 
            ? `Tidak ada transaksi dalam ${filter === 'week' ? 'seminggu' : 'sebulan'} terakhir` 
            : 'Belum ada transaksi'}
        </div>
      )}
    </div>
  );
};

export default TransactionList;