import { z } from "zod";
import { StudentSchema, CreateUserSchema } from "./user.schema";

const ProfileTypeEnum = z.enum([
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
]);

/**
 * Schema para MockAthlete (essencialmente um Student com dados extras)
 */
export const AthleteSchema = StudentSchema.extend({
  // Podem adicionar campos específicos de atleta se necessário
  performanceLevel: z.enum(["iniciante", "intermediário", "avançado"]).optional(),
  goals: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
});

export type Athlete = z.infer<typeof AthleteSchema>;

/**
 * Schema para criação de atleta (sem ID)
 */
export const CreateAthleteSchema = CreateUserSchema.extend({
  role: z.literal("student"),
  performanceLevel: z.enum(["iniciante", "intermediário", "avançado"]).optional(),
  goals: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
});

export type CreateAthleteData = z.infer<typeof CreateAthleteSchema>;

/**
 * Schema para atualização de atleta
 */
export const UpdateAthleteSchema = AthleteSchema.partial().omit({
  id: true,
  role: true,
});

export type UpdateAthleteData = z.infer<typeof UpdateAthleteSchema>;

/**
 * Schema para filtro de atletas
 */
export const AthleteFilterSchema = z.object({
  profile: ProfileTypeEnum.optional(),
  performanceLevel: z.enum(["iniciante", "intermediário", "avançado"]).optional(),
  searchTerm: z.string().optional(),
});

export type AthleteFilter = z.infer<typeof AthleteFilterSchema>;
