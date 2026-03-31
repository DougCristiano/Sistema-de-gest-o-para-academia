import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { User, UserRole, ProfileType } from "../types";
import { mockUsers } from "../data/mockData";

interface AuthContextType {
  currentUser: User | null;
  currentProfile: ProfileType | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchProfile: (profile: ProfileType) => void;
  updateUser: (updatedData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "huron_auth_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuário do localStorage no mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        if (user.profiles.length > 0) {
          setCurrentProfile(user.profiles[0]);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login com async e persistência
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simular delay de rede
        await new Promise((resolve) => setTimeout(resolve, 300));

        const user = mockUsers.find((u) => u.email === email);
        if (!user) {
          setError("Usuário não encontrado");
          return false;
        }

        setCurrentUser(user);
        if (user.profiles.length > 0) {
          setCurrentProfile(user.profiles[0]);
        }

        // Persistir no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout com limpeza
  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Trocar perfil
  const switchProfile = useCallback((profile: ProfileType) => {
    setCurrentUser((prev) => {
      if (prev?.profiles.includes(profile)) {
        setCurrentProfile(profile);
        // Atualizar localStorage
        const updated = { ...prev };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  // Atualizar dados do usuário
  const updateUser = useCallback((updatedData: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        isLoading,
        error,
        login,
        logout,
        switchProfile,
        updateUser,
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
