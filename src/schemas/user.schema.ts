import { z } from "zod";

const ProfileTypeEnum = z.enum([
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
]);

const UserRoleEnum = z.enum(["admin", "manager", "teacher", "student"]);

const GenderEnum = z.enum(["masculino", "feminino", "outro", "prefiro-nao-informar"]);

/**
 * Schema para endereço
 */
export const AddressSchema = z.object({
  street: z.string().min(3, "Rua inválida"),
  number: z.string().min(1, "Número inválido"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro inválido"),
  city: z.string().min(3, "Cidade inválida"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido (formato: 00000-000)"),
});

export type Address = z.infer<typeof AddressSchema>;

/**
 * Schema para contato de emergência
 */
export const EmergencyContactSchema = z.object({
  name: z.string().min(3, "Nome inválido"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  relationship: z.string().min(3, "Parentesco inválido"),
});

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

/**
 * Schema base para User
 */
export const UserBaseSchema = z.object({
  id: z.string().min(1, "ID inválido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  role: UserRoleEnum,
  profiles: z.array(ProfileTypeEnum),
  studentProfiles: z.array(ProfileTypeEnum).optional(),
  avatar: z.string().url().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato: YYYY-MM-DD)"),
  gender: GenderEnum,
  address: AddressSchema,
  emergencyContact: EmergencyContactSchema.optional(),
});

/**
 * Schema para User
 */
export const UserSchema = UserBaseSchema;

export type User = z.infer<typeof UserSchema>;

/**
 * Schema para Manager
 */
export const ManagerSchema = UserBaseSchema.extend({
  role: z.literal("manager"),
  managedProfile: ProfileTypeEnum,
  isAlsoTeacher: z.boolean(),
});

export type Manager = z.infer<typeof ManagerSchema>;

/**
 * Schema para Teacher
 */
export const TeacherSchema = UserBaseSchema.extend({
  role: z.literal("teacher"),
  specialty: z.string().min(3, "Especialidade inválida"),
});

export type Teacher = z.infer<typeof TeacherSchema>;

/**
 * Schema para Student
 */
export const StudentSchema = UserBaseSchema.extend({
  role: z.literal("student"),
  enrolledProfiles: z.array(ProfileTypeEnum),
});

export type Student = z.infer<typeof StudentSchema>;

/**
 * Schema para criação de usuário (sem ID)
 */
export const CreateUserSchema = UserBaseSchema.omit({ id: true });

export type CreateUserData = z.infer<typeof CreateUserSchema>;

/**
 * Schema para atualização de usuário
 */
export const UpdateUserSchema = UserBaseSchema.partial().omit({ id: true, role: true });

export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
