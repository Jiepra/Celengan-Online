import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface SavingsTargetCardProps {
  currentAmount: number;
  targetAmount: number;
}

const SavingsTargetCard: React.FC<SavingsTargetCardProps> = ({ currentAmount, targetAmount }) => {
  // Hitung persentase progres
  const calculateProgress = (): number => {
    if (targetAmount <= 0) return 0;
    const percentage = (currentAmount / targetAmount) * 100;
    return Math.min(percentage, 100); // Pastikan tidak lebih dari 100%
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Target Tabungan</h2>
      <div className="text-3xl font-bold text-primary mb-2">
        {formatCurrency(targetAmount)}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span>Progress: {formatCurrency(currentAmount)} ({progressPercentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
};

export default SavingsTargetCard;