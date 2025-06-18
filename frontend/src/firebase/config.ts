// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase config
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase
try {
  validateConfig();
  console.log('Initializing Firebase with project ID:', firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // Sign in with Google
const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful');
      return result.user;
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal login dengan Google');
    }
  };

  // Sign out
const logOut = async () => {
    try {
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal logout');
    }
  };

  // Listen to auth state changes
const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      callback(user);
    });
  };

} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Declare the functions first
let signInWithGoogle: () => Promise<User>;
let logOut: () => Promise<void>;
let onAuthChange: (callback: (user: User | null) => void) => () => void;

try {
  validateConfig();
  console.log('Initializing Firebase with project ID:', firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // Implement the functions
  signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful');
      return result.user;
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal login dengan Google');
    }
  };

  logOut = async () => {
    try {
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal logout');
    }
  };

  onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      callback(user);
    });
  };

} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Register with email and password
const registerWithEmail = async (email: string, password: string) => {
  try {
    console.log('Starting email registration process...');
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email registration successful');
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Error registering with email:', error);
    
    // Menangani error khusus untuk auth/operation-not-allowed
    if (error instanceof Error && error.message.includes('auth/operation-not-allowed')) {
      throw new Error('Registrasi dengan email/password belum diaktifkan di Firebase Console. Silakan hubungi administrator untuk mengaktifkan metode autentikasi email/password di Firebase Console.');
    }
    
    throw new Error(error instanceof Error ? error.message : 'Gagal mendaftar dengan email');
  }
};

// Sign in with email and password
const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Starting email sign-in process...');
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful');
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Error signing in with email:', error);
    
    // Menangani error khusus untuk auth/operation-not-allowed
    if (error instanceof Error && error.message.includes('auth/operation-not-allowed')) {
      throw new Error('Login dengan email/password belum diaktifkan di Firebase Console. Silakan hubungi administrator untuk mengaktifkan metode autentikasi email/password di Firebase Console.');
    }
    
    throw new Error(error instanceof Error ? error.message : 'Gagal login dengan email');
  }
};

export { signInWithGoogle, logOut, onAuthChange, getAuth, registerWithEmail, signInWithEmail };
