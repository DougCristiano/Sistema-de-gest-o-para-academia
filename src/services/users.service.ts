import { User, UserRole, ProfileType } from "../types";
import { mockUsers } from "../data/mockData";

/**
 * Serviço de Usuários
 * Gerencia operações CRUD de usuários (Admin/Manager/Teacher)
 */

export const usersService = {
  /**
   * Retorna todos os usuários
   */
  getAllUsers: (): User[] => {
    return [...mockUsers];
  },

  /**
   * Retorna usuários por role
   */
  getUsersByRole: (role: UserRole): User[] => {
    return mockUsers.filter((user) => user.role === role);
  },

  /**
   * Retorna usuários excluindo alunos (para admin gerenciar)
   */
  getManageableUsers: (): User[] => {
    return mockUsers.filter((user) => user.role !== "student");
  },

  /**
   * Retorna usuário por ID
   */
  getUserById: (id: string): User | null => {
    return mockUsers.find((user) => user.id === id) || null;
  },

  /**
   * Retorna usuário por email
   */
  getUserByEmail: (email: string): User | null => {
    return mockUsers.find((user) => user.email === email) || null;
  },

  /**
   * Retorna usuários que trabalham em um perfil
   */
  getUsersByProfile: (profile: ProfileType): User[] => {
    return mockUsers.filter((user) => user.profiles.includes(profile));
  },

  /**
   * Retorna professores de um perfil específico
   */
  getTeachersByProfile: (profile: ProfileType): User[] => {
    return mockUsers.filter(
      (user) => user.role === "teacher" && user.profiles.includes(profile)
    );
  },

  /**
   * Cria novo usuário (mock - apenas adiciona ao array)
   */
  createUser: (userData: Omit<User, "id">): User => {
    const newId = `user-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
    };
    mockUsers.push(newUser);
    return newUser;
  },

  /**
   * Atualiza usuário existente
   */
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = { ...mockUsers[userIndex], ...updates };
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  /**
   * Deleta usuário (mock - remove do array)
   */
  deleteUser: (id: string): boolean => {
    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;
    mockUsers.splice(userIndex, 1);
    return true;
  },

  /**
   * Busca usuários por termo (nome ou email)
   */
  searchUsers: (searchTerm: string, role?: UserRole): User[] => {
    let results = mockUsers;

    if (role) {
      results = results.filter((user) => user.role === role);
    }

    const term = searchTerm.toLowerCase();
    return results.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  },

  /**
   * Retorna contagem total de usuários por role
   */
  getUserCountByRole: (): Record<UserRole, number> => {
    return {
      admin: mockUsers.filter((u) => u.role === "admin").length,
      manager: mockUsers.filter((u) => u.role === "manager").length,
      teacher: mockUsers.filter((u) => u.role === "teacher").length,
      student: mockUsers.filter((u) => u.role === "student").length,
    };
  },

  /**
   * Adiciona um perfil a um usuário
   */
  addProfileToUser: (userId: string, profile: ProfileType): User | null => {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return null;

    if (!user.profiles.includes(profile)) {
      user.profiles.push(profile);
    }
    return user;
  },

  /**
   * Remove um perfil de um usuário
   */
  removeProfileFromUser: (userId: string, profile: ProfileType): User | null => {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return null;

    user.profiles = user.profiles.filter((p) => p !== profile);
    return user;
  },
};
