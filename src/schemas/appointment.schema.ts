import { z } from "zod";

const ProfileTypeEnum = z.enum([
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
]);

/**
 * Schema para Appointment (agendamento)
 */
export const AppointmentSchema = z.object({
  id: z.string().min(1, "ID inválido"),
  studentId: z.string().min(1, "ID do aluno inválido"),
  studentName: z.string().min(3, "Nome do aluno inválido"),
  teacherId: z.string().min(1, "ID do professor inválido"),
  teacherName: z.string().min(3, "Nome do professor inválido"),
  profile: ProfileTypeEnum,
  date: z.coerce.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido (formato: HH:mm)"),
  duration: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(180, "Duração máxima é 180 minutos"),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

/**
 * Schema para criação de agendamento
 */
export const CreateAppointmentSchema = AppointmentSchema.omit({ id: true, date: true }).extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato: YYYY-MM-DD)"),
});

export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>;

/**
 * Schema para atualização de agendamento
 */
export const UpdateAppointmentSchema = AppointmentSchema.partial().omit({ id: true });

export type UpdateAppointmentData = z.infer<typeof UpdateAppointmentSchema>;

/**
 * Schema para status de agendamento
 */
export const AppointmentStatusSchema = z.enum(["scheduled", "completed", "cancelled"]);

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

/**
 * Schema para filtro de agendamentos
 */
export const AppointmentFilterSchema = z.object({
  studentId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  profile: ProfileTypeEnum.optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type AppointmentFilter = z.infer<typeof AppointmentFilterSchema>;

/**
 * Schema para disponibilidade de horário
 */
export const TimeSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  available: z.boolean(),
  teacherId: z.string().min(1, "ID do professor inválido"),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
