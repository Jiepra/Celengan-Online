import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Transaction, User, SavingsGoal } from '../types';
import { onAuthChange } from '../firebase/config';
import { User as FirebaseUser } from 'firebase/auth';
import { usePiggyBanks } from '../hooks/usePiggyBanks';
import { useTransactions } from '../hooks/useTransactions'; // Tambahkan import ini

interface AppState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_FIREBASE_USER'; payload: FirebaseUser | null }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SAVINGS_GOALS'; payload: SavingsGoal[] }; // Add this line

const initialState: AppState = {
  user: null,
  firebaseUser: null,
  transactions: [],
  savingsGoals: [],
  isLoading: false,
  error: null,
  isAuthenticated: false
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => null });

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_FIREBASE_USER':
      return { ...state, firebaseUser: action.payload, isAuthenticated: !!action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(goal => goal.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_SAVINGS_GOALS': // Add this case
      return { ...state, savingsGoals: action.payload };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { getPiggyBanks } = usePiggyBanks();
  
  // Gunakan custom hook useTransactions
  const { getTransactions } = useTransactions();

  // Listen to Firebase auth state changes
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      try {
        dispatch({ type: 'SET_FIREBASE_USER', payload: firebaseUser as FirebaseUser });
        
        if (firebaseUser) {
          // Register user in backend
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/firebase-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            })
          });

          if (!response.ok) {
            throw new Error('Gagal mendaftarkan pengguna ke backend');
          }

          // Create or update user in our app state
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            balance: 0,
            savingsTarget: 0
          };
          
          dispatch({ type: 'SET_USER', payload: appUser });

          // Fetch piggy banks after successful login/registration
          const fetchedPiggyBanks = await getPiggyBanks();
          dispatch({ type: 'SET_SAVINGS_GOALS', payload: fetchedPiggyBanks });
          
          // Fetch transactions after successful login/registration
          const transactions = await getTransactions();
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

        } else {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_SAVINGS_GOALS', payload: [] }); // Clear savings goals on logout
          dispatch({ type: 'SET_TRANSACTIONS', payload: [] }); // Clear transactions on logout
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unknown error occurred.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [getPiggyBanks, getTransactions]); // Add getTransactions to dependency array

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};