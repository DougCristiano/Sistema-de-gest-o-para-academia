import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, ProfileType } from "../types";
import { mockUsers } from "../data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchProfile: (profile: ProfileType) => void;
  currentProfile: ProfileType | null;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ProfileType | null>(
    null,
  );

  const login = (email: string, password: string): boolean => {
    // Mock login - aceita qualquer senha
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      if (user.profiles.length > 0) {
        setCurrentProfile(user.profiles[0]);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
  };

  const switchProfile = (profile: ProfileType) => {
    if (currentUser?.profiles.includes(profile)) {
      setCurrentProfile(profile);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchProfile,
        currentProfile,
        updateUser,
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
