import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Transaction } from '../types';
import { getAuth } from '../firebase/config';
const auth = getAuth();

export const useTransactions = () => {
  const { state, dispatch } = useApp();

  const addTransaction = useCallback(async (type: 'deposit' | 'withdrawal', amount: number, piggyBankId: string, description?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Debug log
      console.log('Adding transaction with piggyBankId:', piggyBankId);
      
      // Pastikan user sudah login dan ada token Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Anda harus login terlebih dahulu');
      }
      
      // Dapatkan token ID Firebase
      const idToken = await currentUser.getIdToken();
      
      // Debug log untuk request body
      const requestBody = {
        type,
        amount,
        piggyBankId,
        description
      };
      console.log('Request body:', requestBody);
      
      // Panggil API backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transaction error response:', errorData);
        throw new Error(errorData.message || 'Gagal menambahkan transaksi');
      }
      
      const data = await response.json();
      const newTransaction: Transaction = {
        id: data.transaction._id,
        type: data.transaction.type,
        amount: data.transaction.amount,
        date: new Date(data.transaction.createdAt),
        description: data.transaction.description
      };

      // Update local state
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });

      // Update user balance dari respons API
      if (state.user && data.newBalance !== undefined) {
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, balance: data.newBalance }
        });
      }
      
      // Update celengan yang diperbarui dalam state
      if (data.updatedPiggyBank) {
        const updatedPiggyBank = data.updatedPiggyBank;
        const updatedSavingsGoal = {
          id: updatedPiggyBank._id,
          userId: updatedPiggyBank.userId,
          title: updatedPiggyBank.name,
          targetAmount: updatedPiggyBank.goalAmount,
          currentAmount: updatedPiggyBank.currentAmount,
          description: updatedPiggyBank.description
        };
        
        dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: updatedSavingsGoal });
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Gagal menambahkan transaksi. Silakan coba lagi.'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, dispatch]);

  const getTransactions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Pastikan user sudah login dan ada token Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Anda harus login terlebih dahulu');
      }
      
      // Dapatkan token ID Firebase
      const idToken = await currentUser.getIdToken();
      
      // Panggil API backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data transaksi');
      }
      
      const data = await response.json();
      const transactions: Transaction[] = data.transactions.map((tx: any) => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        date: new Date(tx.createdAt),
        description: tx.description
      }));
      
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      return transactions;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Gagal mengambil data transaksi. Silakan coba lagi.'
      });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  return {
    transactions: state.transactions,
    isLoading: state.isLoading,
    error: state.error,
    addTransaction,
    getTransactions
  };
};