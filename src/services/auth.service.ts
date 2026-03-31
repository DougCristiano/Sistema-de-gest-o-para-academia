import { User } from "../types";
import { mockUsers } from "../data/mockData";

/**
 * Serviço de Autenticação
 * Centraliza lógica de login, logout e validação de usuário
 */

export const authService = {
  /**
   * Realiza login mock (sem validação de senha)
   */
  login: (email: string, password: string): User | null => {
    const user = mockUsers.find((u) => u.email === email);
    return user || null;
  },

  /**
   * Retorna usuário por ID
   */
  getUserById: (id: string): User | null => {
    return mockUsers.find((u) => u.id === id) || null;
  },

  /**
   * Valida se o usuário tem permissão para acessar um recurso
   */
  hasPermission: (user: User, requiredRoles: string[]): boolean => {
    return requiredRoles.includes(user.role);
  },

  /**
   * Valida se o usuário está autenticado
   */
  isAuthenticated: (user: User | null): boolean => {
    return user !== null;
  },

  /**
   * Atualiza perfil do usuário (mock)
   */
  updateProfile: (userId: string, updates: Partial<User>): User | null => {
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const updatedUser = { ...mockUsers[userIndex], ...updates };
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  /**
   * Retorna nome exibível do usuário
   */
  getDisplayName: (user: User): string => {
    return user.name;
  },

  /**
   * Mapa de roles para labels
   */
  getRoleLabel: (
    role: string
  ): Record<"admin" | "manager" | "teacher" | "student", string> => {
    const roleLabels = {
      admin: "Administrador",
      manager: "Gerente",
      teacher: "Professor",
      student: "Aluno",
    };
    return roleLabels as any;
  },
};
