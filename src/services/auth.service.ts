import { User } from "../types";
import { mockUsers } from "../data/mockData";
import { AuthUserSchema } from "../schemas";

/**
 * Serviço de Autenticação
 * Centraliza lógica de login, logout e validação de usuário
 * Todos os dados são validados com Zod antes de retornar
 */

export const authService = {
  /**
   * Valida dados do usuário com Zod
   * @throws Error se dados são inválidos
   */
  _validateUser: (user: unknown): User => {
    return AuthUserSchema.parse(user);
  },

  /**
   * Realiza login mock (sem validação de senha)
   */
  login: (email: string, _password: string): User | null => {
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {return null;}
    try {
      return authService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  },

  /**
   * Retorna usuário por ID
   */
  getUserById: (id: string): User | null => {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {return null;}
    try {
      return authService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
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
    if (userIndex === -1) {return null;}

    const updatedUser = { ...mockUsers[userIndex], ...updates };
    mockUsers[userIndex] = updatedUser;

    try {
      return authService._validateUser(updatedUser);
    } catch (error) {
      console.error("Invalid user data after update:", error);
      return null;
    }
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
  getRoleLabel: (_role: string): Record<"admin" | "manager" | "teacher" | "student", string> => {
    const roleLabels = {
      admin: "Administrador",
      manager: "Gerente",
      teacher: "Professor",
      student: "Aluno",
    };
    return roleLabels as any;
  },
};
