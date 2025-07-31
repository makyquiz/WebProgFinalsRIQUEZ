import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        throw new Error('Email already in use');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw formatAuthError(error);
    }
  }

  async function login(email, password) {
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw formatAuthError(error);
    }
  }

  function logout() {
    return signOut(auth);
  }

  function formatAuthError(error) {
    switch (error.code) {
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/user-disabled':
        return new Error('Account disabled');
      case 'auth/user-not-found':
        return new Error('No account found with this email');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/too-many-requests':
        return new Error('Account temporarily locked due to many failed attempts');
      case 'auth/email-already-in-use':
        return new Error('Email already in use');
      default:
        return new Error('Authentication failed. Please try again.');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}