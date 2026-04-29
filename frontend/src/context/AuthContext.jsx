import { createContext, useContext, useEffect, useState } from "react";

import authApi from "../api/authApi";

const AuthContext = createContext(null);

function persistTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.me();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const login = async (email, password) => {
    const tokens = await authApi.login({ username: email, password });
    persistTokens(tokens.access, tokens.refresh);
    const currentUser = await authApi.me();
    setUser(currentUser);
    return currentUser;
  };

  const loginWithGitHub = async (code) => {
    const response = await authApi.github({ code });
    persistTokens(response.access, response.refresh);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    loginWithGitHub,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
