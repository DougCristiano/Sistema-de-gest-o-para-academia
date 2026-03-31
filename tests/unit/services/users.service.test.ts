import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { usersService } from "@/services/users.service";
import { mockUsers } from "@/data/mockData";

describe("usersService", () => {
  // Guardar estado original dos usuários para restaurar depois
  let originalUsers: typeof mockUsers;

  beforeEach(() => {
    // Fazer backup
    originalUsers = JSON.parse(JSON.stringify(mockUsers));
  });

  afterEach(() => {
    // Restaurar estado original
    mockUsers.length = 0;
    mockUsers.push(...originalUsers);
  });

  describe("getAllUsers", () => {
    it("should return all users", () => {
      const result = usersService.getAllUsers();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return validated users", () => {
      const result = usersService.getAllUsers();
      result.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toMatch(/admin|manager|teacher|student/);
      });
    });
  });

  describe("getUsersByRole", () => {
    it("should return only admin users", () => {
      const result = usersService.getUsersByRole("admin");
      result.forEach((user) => {
        expect(user.role).toBe("admin");
      });
    });

    it("should return only student users", () => {
      const result = usersService.getUsersByRole("student");
      result.forEach((user) => {
        expect(user.role).toBe("student");
      });
    });

    it("should return empty array when no users match role", () => {
      // Remover todos os students temporariamente
      const students = mockUsers.filter((u) => u.role === "student");
      students.forEach((s) => {
        mockUsers.splice(mockUsers.indexOf(s), 1);
      });

      const result = usersService.getUsersByRole("student");
      expect(result.length).toBe(0);
    });
  });

  describe("getManageableUsers", () => {
    it("should return users excluding students", () => {
      const result = usersService.getManageableUsers();
      result.forEach((user) => {
        expect(user.role).not.toBe("student");
      });
    });

    it("should include admin, manager, and teacher", () => {
      const result = usersService.getManageableUsers();
      const roles = new Set(result.map((u) => u.role));

      // Verificar se há pelo menos alguns tipos de usuários não-student
      expect(roles.size).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(["admin", "manager", "teacher"]).toContain(user.role);
      });
    });
  });

  describe("getUserById", () => {
    it("should return user by valid ID", () => {
      const user = mockUsers[0];
      const result = usersService.getUserById(user.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it("should return null for invalid ID", () => {
      const result = usersService.getUserById("nonexistent-id-12345");
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by valid email", () => {
      const user = mockUsers[0];
      const result = usersService.getUserByEmail(user.email);
      expect(result).toBeDefined();
      expect(result?.email).toBe(user.email);
    });

    it("should return null for invalid email", () => {
      const result = usersService.getUserByEmail("nonexistent@email.com");
      expect(result).toBeNull();
    });
  });

  describe("searchUsers", () => {
    it("should find users by name", () => {
      const user = mockUsers[0];
      const searchTerm = user.name.substring(0, 3); // Primeiros 3 caracteres

      const result = usersService.searchUsers(searchTerm);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((u) => u.id === user.id)).toBe(true);
    });

    it("should find users by email", () => {
      const user = mockUsers[0];
      const searchTerm = user.email.split("@")[0]; // Parte antes do @

      const result = usersService.searchUsers(searchTerm);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((u) => u.id === user.id)).toBe(true);
    });

    it("should be case-insensitive", () => {
      const user = mockUsers[0];
      const result1 = usersService.searchUsers(user.name.toLowerCase());
      const result2 = usersService.searchUsers(user.name.toUpperCase());

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
      expect(result1.some((u) => u.id === user.id)).toBe(true);
    });

    it("should filter by role when provided", () => {
      const result = usersService.searchUsers("", "admin");
      result.forEach((user) => {
        expect(user.role).toBe("admin");
      });
    });
  });

  describe("createUser", () => {
    it("should create new user with generated ID", () => {
      const newUserData = {
        name: "Test User",
        email: "test@example.com",
        role: "student" as const,
        profiles: ["huron-areia"],
        cpf: "123.456.789-10",
        phone: "(11) 98765-4321",
        birthDate: "1990-01-01",
        gender: "masculino" as const,
        address: {
          street: "Rua Test",
          number: "123",
          neighborhood: "Test",
          city: "Test City",
          state: "SP",
          zipCode: "12345-678",
        },
      };

      const initialCount = mockUsers.length;
      const result = usersService.createUser(newUserData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(newUserData.name);
      expect(result.email).toBe(newUserData.email);
      expect(mockUsers.length).toBe(initialCount + 1);
    });
  });

  describe("updateUser", () => {
    it("should update existing user", () => {
      const user = mockUsers[0];
      const originalName = user.name;
      const newName = "Updated Name";

      const result = usersService.updateUser(user.id, { name: newName });

      expect(result).toBeDefined();
      expect(result?.name).toBe(newName);
      expect(result?.id).toBe(user.id);

      // Restaurar
      usersService.updateUser(user.id, { name: originalName });
    });

    it("should return null for invalid user ID", () => {
      const result = usersService.updateUser("invalid-id", { name: "New Name" });
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete existing user", () => {
      const initialCount = mockUsers.length;
      const userToDelete = mockUsers[mockUsers.length - 1];

      const result = usersService.deleteUser(userToDelete.id);

      expect(result).toBe(true);
      expect(mockUsers.length).toBe(initialCount - 1);
      expect(usersService.getUserById(userToDelete.id)).toBeNull();
    });

    it("should return false when user does not exist", () => {
      const result = usersService.deleteUser("invalid-id");
      expect(result).toBe(false);
    });
  });

  describe("getUserCountByRole", () => {
    it("should return count of users by each role", () => {
      const result = usersService.getUserCountByRole();

      expect(result.admin).toBeGreaterThanOrEqual(0);
      expect(result.manager).toBeGreaterThanOrEqual(0);
      expect(result.teacher).toBeGreaterThanOrEqual(0);
      expect(result.student).toBeGreaterThanOrEqual(0);

      const total = result.admin + result.manager + result.teacher + result.student;
      expect(total).toBe(mockUsers.length);
    });
  });

  describe("searchUsers", () => {
    it("should search users by name", () => {
      const result = usersService.searchUsers(mockUsers[0].name.substring(0, 3));
      expect(Array.isArray(result)).toBe(true);
    });

    it("should search users by email", () => {
      const result = usersService.searchUsers("email");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for no matches", () => {
      const result = usersService.searchUsers("NonExistentUserWith12345XYZ");
      expect(result).toEqual([]);
    });
  });

  describe("updateUser", () => {
    it("should update user properties", () => {
      const user = mockUsers[0];
      const updates = { name: "Updated Name", email: "updated@example.com" };

      const result = usersService.updateUser(user.id, updates);

      expect(result).toBeDefined();
      expect(result?.name).toBe(updates.name);
      expect(result?.email).toBe(updates.email);
    });

    it("should return null for non-existent user", () => {
      const result = usersService.updateUser("invalid-id", { name: "New Name" });
      expect(result).toBeNull();
    });
  });
});
