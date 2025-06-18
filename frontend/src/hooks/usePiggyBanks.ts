import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { SavingsGoal } from '../types';
import { getAuth } from 'firebase/auth';
const auth = getAuth();

export const usePiggyBanks = () => {
  const { state, dispatch } = useApp();

  const createPiggyBank = useCallback(async (name: string, goalAmount: number, description?: string) => {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/piggybanks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name,
          goalAmount,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat celengan baru');
      }
      
      const data = await response.json();
      const newPiggyBank: SavingsGoal = {
        id: data.piggyBank._id,
        userId: data.piggyBank.userId,
        title: data.piggyBank.name,
        targetAmount: data.piggyBank.goalAmount,
        currentAmount: data.piggyBank.currentAmount,
        description: data.piggyBank.description
      };

      // Update local state
      dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newPiggyBank });
      
      return newPiggyBank;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const getPiggyBanks = useCallback(async () => {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/piggybanks`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data celengan');
      }
      
      const data = await response.json();
      const piggyBanks: SavingsGoal[] = data.map((pb: any) => ({
        id: pb._id,
        userId: pb.userId,
        title: pb.name,
        targetAmount: pb.goalAmount,
        currentAmount: pb.currentAmount,
        description: pb.description
      }));
      
      return piggyBanks;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const updatePiggyBank = useCallback(async (id: string, updates: { name?: string, goalAmount?: number, description?: string }) => {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/piggybanks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: updates.name,
          goalAmount: updates.goalAmount,
          description: updates.description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui celengan');
      }
      
      const data = await response.json();
      const updatedPiggyBank: SavingsGoal = {
        id: data._id,
        userId: data.userId,
        title: data.name,
        targetAmount: data.goalAmount,
        currentAmount: data.currentAmount,
        description: data.description
      };

      // Update local state
      dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: updatedPiggyBank });
      
      return updatedPiggyBank;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const deletePiggyBank = useCallback(async (id: string) => {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/piggybanks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus celengan');
      }
      
      // Update local state
      dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
      
      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  return {
    createPiggyBank,
    getPiggyBanks,
    updatePiggyBank,
    deletePiggyBank,
    savingsGoals: state.savingsGoals,
    isLoading: state.isLoading,
    error: state.error
  };
};