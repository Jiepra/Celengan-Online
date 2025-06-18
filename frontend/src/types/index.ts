export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: Date;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  savingsTarget: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  title: string;
  description?: string;
}