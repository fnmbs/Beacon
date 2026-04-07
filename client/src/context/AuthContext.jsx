import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken, refreshTokenValue) => {
    setUser(userData);
    setToken(authToken);
    setRefreshToken(refreshTokenValue);
    localStorage.setItem("token", authToken);
    if (refreshTokenValue) {
      localStorage.setItem("refreshToken", refreshTokenValue);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setError(null);
  };

  const register = (userData, authToken, refreshTokenValue) => {
    setUser(userData);
    setToken(authToken);
    setRefreshToken(refreshTokenValue);
    localStorage.setItem("token", authToken);
    if (refreshTokenValue) {
      localStorage.setItem("refreshToken", refreshTokenValue);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setError(null);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const updateToken = (newToken, newRefreshToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setError(null);
  };

  const setAuthError = (errorMessage) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateToken,
        setAuthError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
