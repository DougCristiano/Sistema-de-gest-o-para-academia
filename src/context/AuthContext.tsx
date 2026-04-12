import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { User, ProfileType, UserRole } from "../types";
import { mockUsers } from "../data/mockData";
import { profilesService } from "../services/profiles.service";

interface AuthContextType {
  currentUser: User | null;
  currentProfile: ProfileType | null;
  activeRole: UserRole;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchProfile: (profile: ProfileType) => void;
  switchRole: (role: UserRole) => void;
  updateUser: (updatedData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "huron_auth_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ProfileType | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveUserProfile = useCallback((user: User): ProfileType | null => {
    if (user.role === "manager") {
      const managedProfiles = profilesService
        .getManagedServiceIds(user.id)
        .filter((serviceId): serviceId is ProfileType => profilesService.isValidProfile(serviceId));

      if (managedProfiles.length > 0) {
        return managedProfiles[0];
      }
    }

    return user.profiles.length > 0 ? user.profiles[0] : null;
  }, []);

  // Carregar usuário do localStorage no mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        setCurrentProfile(resolveUserProfile(user));
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [resolveUserProfile]);

  // Login com async e persistência
  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
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
      setCurrentProfile(resolveUserProfile(user));
      setActiveRole(user.role);

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
  }, [resolveUserProfile]);

  // Logout com limpeza
  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setActiveRole("student");
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

  // Trocar contexto de role (ex: admin ↔ aluno)
  const switchRole = useCallback((role: UserRole) => {
    setActiveRole(role);
  }, []);

  // Atualizar dados do usuário
  const updateUser = useCallback((updatedData: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) {return null;}
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
        activeRole,
        isLoading,
        error,
        login,
        logout,
        switchProfile,
        switchRole,
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
