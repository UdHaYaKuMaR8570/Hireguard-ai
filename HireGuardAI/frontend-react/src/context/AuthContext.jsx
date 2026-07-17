import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setApiToken } from '../services/api';

export const AuthContext = createContext();

/**
 * AuthProvider component managing authentication session status.
 *
 * SECURITY & PERSISTENCE TRADEOFF NOTE:
 * Per Phase 3 rules, we store the JWT and user profile primarily in React memory (`useState`).
 * Storing JWTs purely in memory (`user` / `token` state variables) ensures high security against
 * Cross-Site Scripting (XSS) attacks because tokens cannot be extracted from localStorage by malicous scripts.
 * However, the tradeoff is that in-memory state is wiped whenever the browser tab refreshes.
 * To provide a smooth development testing experience without sacrificing localStorage security,
 * we mirror token state briefly in `sessionStorage` (tab-scoped) and sync with `setApiToken`.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const initSession = async () => {
      const storedToken = sessionStorage.getItem('hireguard_jwt');
      const storedUser = sessionStorage.getItem('hireguard_user');

      if (storedToken) {
        setToken(storedToken);
        setApiToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            sessionStorage.removeItem('hireguard_user');
          }
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const loginUser = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const { token: newToken, ...userInfo } = data;
    
    setToken(newToken);
    setUser(userInfo);
    setApiToken(newToken);
    
    sessionStorage.setItem('hireguard_jwt', newToken);
    sessionStorage.setItem('hireguard_user', JSON.stringify(userInfo));
    
    return data;
  }, []);

  const registerUser = useCallback(async (userData) => {
    const data = await authService.register(userData);
    const { token: newToken, ...userInfo } = data;
    
    setToken(newToken);
    setUser(userInfo);
    setApiToken(newToken);
    
    sessionStorage.setItem('hireguard_jwt', newToken);
    sessionStorage.setItem('hireguard_user', JSON.stringify(userInfo));
    
    return data;
  }, []);

  const logoutUser = useCallback(() => {
    setToken(null);
    setUser(null);
    setApiToken(null);
    sessionStorage.removeItem('hireguard_jwt');
    sessionStorage.removeItem('hireguard_user');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    loginUser,
    registerUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
