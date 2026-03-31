import { z } from "zod";

/**
 * Schema para credenciais de login
 */
export const LoginCredentialsSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

/**
 * Schema para resposta de login (User autenticado)
 */
export const AuthUserSchema = z.object({
  id: z.string().min(1, "ID inválido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "teacher", "student"]),
  profiles: z.array(z.enum(["huron-areia", "huron-personal", "huron-recovery", "htri", "avitta"])),
  avatar: z.string().url().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

/**
 * Schema para refresh token
 */
export const RefreshTokenSchema = z.object({
  token: z.string().min(20, "Token inválido"),
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;

/**
 * Schema para permissões
 */
export const PermissionSchema = z.object({
  canCreateUsers: z.boolean(),
  canEditUsers: z.boolean(),
  canDeleteUsers: z.boolean(),
  canViewAppointments: z.boolean(),
  canCreateAppointments: z.boolean(),
  canViewNews: z.boolean(),
  canCreateNews: z.boolean(),
  canViewReports: z.boolean(),
});

export type Permission = z.infer<typeof PermissionSchema>;
