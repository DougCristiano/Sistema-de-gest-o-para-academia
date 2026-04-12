import { User, UserRole, ProfileType } from "../types";
import { mockUsers } from "../data/mockData";
import { UserSchema } from "../schemas";

/**
 * Serviço de Colaboradores
 * Gerencia operações CRUD de colaboradores (Admin/Manager/Teacher)
 * Todos os dados são validados com Zod antes de retornar
 */

export const usersService = {
  /**
   * Valida dados do usuário com Zod
   * @throws Error se dados são inválidos
   */
  _validateUser: (user: unknown): User => {
    return UserSchema.parse(user);
  },

  /**
   * Valida e filtra array de usuários
   */
  _validateUsers: (users: unknown[]): User[] => {
    return users.map((u) => usersService._validateUser(u));
  },

  /**
   * Retorna todos os usuários
   */
  getAllUsers: (): User[] => {
    try {
      return usersService._validateUsers(mockUsers);
    } catch (error) {
      console.error("Invalid users data:", error);
      return [];
    }
  },

  /**
   * Retorna usuários por role
   */
  getUsersByRole: (role: UserRole): User[] => {
    try {
      return usersService._validateUsers(mockUsers.filter((user) => user.role === role));
    } catch (error) {
      console.error("Invalid users data:", error);
      return [];
    }
  },

  /**
   * Retorna usuários excluindo alunos (para admin gerenciar)
   */
  getManageableUsers: (): User[] => {
    try {
      return usersService._validateUsers(mockUsers.filter((user) => user.role !== "student"));
    } catch (error) {
      console.error("Invalid users data:", error);
      return [];
    }
  },

  /**
   * Retorna usuário por ID
   */
  getUserById: (id: string): User | null => {
    const user = mockUsers.find((user) => user.id === id);
    if (!user) {return null;}
    try {
      return usersService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  },

  /**
   * Retorna usuário por email
   */
  getUserByEmail: (email: string): User | null => {
    const user = mockUsers.find((user) => user.email === email);
    if (!user) {return null;}
    try {
      return usersService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  },

  /**
   * Retorna usuários que trabalham em um perfil
   */
  getUsersByProfile: (profile: ProfileType): User[] => {
    try {
      return usersService._validateUsers(
        mockUsers.filter((user) => user.profiles.includes(profile))
      );
    } catch (error) {
      console.error("Invalid users data:", error);
      return [];
    }
  },

  /**
   * Retorna professores de um perfil específico
   */
  getTeachersByProfile: (profile: ProfileType): User[] => {
    try {
      return usersService._validateUsers(
        mockUsers.filter((user) => user.role === "teacher" && user.profiles.includes(profile))
      );
    } catch (error) {
      console.error("Invalid users data:", error);
      return [];
    }
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
    try {
      const validatedUser = usersService._validateUser(newUser);
      mockUsers.push(validatedUser);
      return validatedUser;
    } catch (error) {
      console.error("Invalid user data on creation:", error);
      throw error;
    }
  },

  /**
   * Atualiza usuário existente
   */
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {return null;}

    const updatedUser = { ...mockUsers[userIndex], ...updates };
    try {
      const validatedUser = usersService._validateUser(updatedUser);
      mockUsers[userIndex] = validatedUser;
      return validatedUser;
    } catch (error) {
      console.error("Invalid user data on update:", error);
      return null;
    }
  },

  /**
   * Deleta usuário (mock - remove do array)
   */
  deleteUser: (id: string): boolean => {
    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {return false;}
    mockUsers.splice(userIndex, 1);
    return true;
  },

  /**
   * Busca usuários por termo (nome ou email)
   */
  searchUsers: (searchTerm: string, role?: UserRole): User[] => {
    try {
      let results = mockUsers;

      if (role) {
        results = results.filter((user) => user.role === role);
      }

      const term = searchTerm.toLowerCase();
      const filtered = results.filter(
        (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
      );

      return usersService._validateUsers(filtered);
    } catch (error) {
      console.error("Invalid users data on search:", error);
      return [];
    }
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
    if (!user) {return null;}

    if (!user.profiles.includes(profile)) {
      user.profiles.push(profile);
    }

    try {
      return usersService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data after adding profile:", error);
      return null;
    }
  },

  /**
   * Remove um perfil de um usuário
   */
  removeProfileFromUser: (userId: string, profile: ProfileType): User | null => {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {return null;}

    user.profiles = user.profiles.filter((p) => p !== profile);

    try {
      return usersService._validateUser(user);
    } catch (error) {
      console.error("Invalid user data after removing profile:", error);
      return null;
    }
  },
};
