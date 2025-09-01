import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, AuthContextType } from "../types";
import { authService, tokenManager } from "../services/api";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = tokenManager.getToken();
        if (savedToken) {
          // Verify token is still valid by getting user profile
          const response = await authService.getProfile();
          if (response.success && response.data?.user) {
            setToken(savedToken);
            setUser(response.data.user);
            tokenManager.setToken(savedToken); // Ensure axios header is set
          } else {
            // Token is invalid, clear it
            tokenManager.removeToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        tokenManager.removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - stores token and user data
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    tokenManager.setToken(newToken);
  };

  // Logout function - clears all auth data
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setToken(null);
      setUser(null);
      tokenManager.removeToken();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
