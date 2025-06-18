import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../contexts/AppContext';

interface BalanceCardProps {
  title: string;
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, balance }) => {
  const { state } = useApp();
  
  // Hitung total saldo dari semua celengan
  const totalBalance = state.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="text-3xl font-bold text-primary">
        {formatCurrency(totalBalance)}
      </div>
    </div>
  );
};

export default BalanceCard;