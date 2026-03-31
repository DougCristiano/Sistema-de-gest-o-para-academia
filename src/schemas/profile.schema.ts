import { z } from "zod";

const ProfileTypeEnum = z.enum([
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
]);

/**
 * Schema para TimeBlock (bloco de horário)
 */
export const TimeBlockSchema = z.object({
  id: z.string().uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inicial inválido (formato: HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário final inválido (formato: HH:mm)"),
});

export type TimeBlock = z.infer<typeof TimeBlockSchema>;

/**
 * Schema para DaySchedule (cronograma diário)
 */
export const DayScheduleSchema = z.object({
  enabled: z.boolean(),
  timeBlocks: z.array(TimeBlockSchema),
});

export type DaySchedule = z.infer<typeof DayScheduleSchema>;

/**
 * Schema para ProfileConfig (configuração de perfil)
 */
export const ProfileConfigSchema = z.object({
  id: z.string().uuid(),
  profile: ProfileTypeEnum,
  schedule: z.record(DayScheduleSchema),
  maxStudentsPerSlot: z.number().min(1, "Máximo de alunos deve ser no mínimo 1"),
  classDuration: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(180, "Duração máxima é 180 minutos"),
  breakBetweenClasses: z
    .number()
    .min(0, "Intervalo não pode ser negativo")
    .max(120, "Intervalo máximo é 120 minutos"),
  allowGroupClasses: z.boolean(),
  maxGroupSize: z.number().min(1, "Tamanho máximo do grupo deve ser no mínimo 1"),
  autoConfirmBookings: z.boolean(),
  cancellationDeadline: z
    .number()
    .min(0, "Prazo não pode ser negativo")
    .max(168, "Prazo máximo é 168 horas (7 dias)"),
  allowWaitlist: z.boolean(),
  notes: z.string().max(1000, "Notas não podem ter mais de 1000 caracteres"),
});

export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;

/**
 * Schema para criação de configuração de perfil
 */
export const CreateProfileConfigSchema = ProfileConfigSchema.omit({ id: true });

export type CreateProfileConfigData = z.infer<typeof CreateProfileConfigSchema>;

/**
 * Schema para atualização de configuração de perfil
 */
export const UpdateProfileConfigSchema = ProfileConfigSchema.partial().omit({
  id: true,
  profile: true,
});

export type UpdateProfileConfigData = z.infer<typeof UpdateProfileConfigSchema>;

/**
 * Schema para estatísticas de perfil
 */
export const ProfileStatsSchema = z.object({
  profile: ProfileTypeEnum,
  totalStudents: z.number().min(0),
  totalTeachers: z.number().min(0),
  appointmentsToday: z.number().min(0),
  appointmentsWeek: z.number().min(0),
  revenue: z.number().min(0).optional(),
  attendanceRate: z.number().min(0).max(100).optional(),
});

export type ProfileStats = z.infer<typeof ProfileStatsSchema>;
