import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/services/auth.service";
import { mockUsers } from "@/data/mockData";

describe("authService", () => {
  describe("login", () => {
    it("should return user when email exists", () => {
      const user = mockUsers[0];
      const result = authService.login(user.email, "any-password");

      expect(result).toBeDefined();
      expect(result?.email).toBe(user.email);
      expect(result?.id).toBe(user.id);
    });

    it("should return null when email does not exist", () => {
      const result = authService.login("nonexistent@email.com", "password");
      expect(result).toBeNull();
    });

    it("should validate user data before returning", () => {
      const user = mockUsers[0];
      const result = authService.login(user.email, "password");

      // Validação: usuário retornado deve ter todas as propriedades requeridas
      if (result) {
        expect(result.id).toBeDefined();
        expect(result.name).toBeDefined();
        expect(result.email).toBeDefined();
        expect(result.role).toMatch(/admin|manager|teacher|student/);
        expect(Array.isArray(result.profiles)).toBe(true);
      }
    });
  });

  describe("getUserById", () => {
    it("should return user by valid ID", () => {
      const user = mockUsers[0];
      const result = authService.getUserById(user.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it("should return null for invalid ID", () => {
      const result = authService.getUserById("invalid-id-12345");
      expect(result).toBeNull();
    });
  });

  describe("hasPermission", () => {
    it("should return true when user role is in required roles", () => {
      const adminUser = mockUsers.find((u) => u.role === "admin");
      if (adminUser) {
        const result = authService.hasPermission(adminUser, ["admin"]);
        expect(result).toBe(true);
      }
    });

    it("should return false when user role is not in required roles", () => {
      const studentUser = mockUsers.find((u) => u.role === "student");
      if (studentUser) {
        const result = authService.hasPermission(studentUser, ["admin", "manager"]);
        expect(result).toBe(false);
      }
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is not null", () => {
      const user = mockUsers[0];
      expect(authService.isAuthenticated(user)).toBe(true);
    });

    it("should return false when user is null", () => {
      expect(authService.isAuthenticated(null)).toBe(false);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile and return updated user", () => {
      const user = mockUsers[0];
      const originalName = user.name;
      const newName = "Updated User Name";

      const result = authService.updateProfile(user.id, { name: newName });

      expect(result).toBeDefined();
      expect(result?.name).toBe(newName);
      expect(result?.id).toBe(user.id);

      // Restore original name
      authService.updateProfile(user.id, { name: originalName });
    });

    it("should return null for invalid user ID", () => {
      const result = authService.updateProfile("invalid-id", { name: "New Name" });
      expect(result).toBeNull();
    });
  });

  describe("getDisplayName", () => {
    it("should return user name", () => {
      const user = mockUsers[0];
      const result = authService.getDisplayName(user);
      expect(result).toBe(user.name);
    });
  });
});
