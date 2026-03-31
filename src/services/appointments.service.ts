import { Appointment, ProfileType } from "../types";
import { mockAppointments } from "../data/mockData";
import { isSameDay, isAfter, isBefore } from "date-fns";
import { AppointmentSchema } from "../schemas";

/**
 * Serviço de Agendamentos
 * Gerencia operações de agendamentos e aulas
 * Todos os dados são validados com Zod antes de retornar
 */

export const appointmentsService = {
  /**
   * Valida dados do agendamento com Zod
   * @throws Error se dados são inválidos
   */
  _validateAppointment: (appointment: unknown): Appointment => {
    return AppointmentSchema.parse(appointment);
  },

  /**
   * Valida e filtra array de agendamentos
   */
  _validateAppointments: (appointments: unknown[]): Appointment[] => {
    return appointments.map((a) => appointmentsService._validateAppointment(a));
  },

  /**
   * Retorna todos os agendamentos
   */
  getAllAppointments: (): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(mockAppointments);
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamento por ID
   */
  getAppointmentById: (id: string): Appointment | null => {
    const appointment = mockAppointments.find((a) => a.id === id);
    if (!appointment) {return null;}
    try {
      return appointmentsService._validateAppointment(appointment);
    } catch (error) {
      console.error("Invalid appointment data:", error);
      return null;
    }
  },

  /**
   * Retorna agendamentos de um aluno
   */
  getAppointmentsByStudent: (studentId: string): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(
        mockAppointments.filter((a) => a.studentId === studentId)
      );
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamentos de um professor
   */
  getAppointmentsByTeacher: (teacherId: string): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(
        mockAppointments.filter((a) => a.teacherId === teacherId)
      );
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamentos de um perfil específico
   */
  getAppointmentsByProfile: (profile: ProfileType): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(
        mockAppointments.filter((a) => a.profile === profile)
      );
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamentos de um dia específico
   */
  getAppointmentsByDate: (date: Date): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(
        mockAppointments.filter((a) => isSameDay(a.date, date))
      );
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamentos de hoje
   */
  getAppointmentsToday: (): Appointment[] => {
    return appointmentsService.getAppointmentsByDate(new Date());
  },

  /**
   * Retorna agendamentos da semana
   */
  getAppointmentsThisWeek: (): Appointment[] => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return mockAppointments.filter((a) => isAfter(a.date, weekStart) && isBefore(a.date, weekEnd));
  },

  /**
   * Retorna agendamentos futuros
   */
  getUpcomingAppointments: (limit = 10): Appointment[] => {
    try {
      const now = new Date();
      const filtered = mockAppointments
        .filter((a) => isAfter(a.date, now) && a.status === "scheduled")
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, limit);
      return appointmentsService._validateAppointments(filtered);
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna agendamentos por status
   */
  getAppointmentsByStatus: (status: "scheduled" | "completed" | "cancelled"): Appointment[] => {
    try {
      return appointmentsService._validateAppointments(
        mockAppointments.filter((a) => a.status === status)
      );
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Cria novo agendamento (mock)
   */
  createAppointment: (appointmentData: Omit<Appointment, "id">): Appointment => {
    const newId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
    };
    try {
      const validatedAppointment = appointmentsService._validateAppointment(newAppointment);
      mockAppointments.push(validatedAppointment);
      return validatedAppointment;
    } catch (error) {
      console.error("Invalid appointment data on creation:", error);
      throw error;
    }
  },

  /**
   * Atualiza agendamento existente
   */
  updateAppointment: (id: string, updates: Partial<Appointment>): Appointment | null => {
    const appointmentIndex = mockAppointments.findIndex((a) => a.id === id);
    if (appointmentIndex === -1) {return null;}

    const updatedAppointment = { ...mockAppointments[appointmentIndex], ...updates };
    try {
      const validatedAppointment = appointmentsService._validateAppointment(updatedAppointment);
      mockAppointments[appointmentIndex] = validatedAppointment;
      return validatedAppointment;
    } catch (error) {
      console.error("Invalid appointment data on update:", error);
      return null;
    }
  },

  /**
   * Deleta agendamento (mock)
   */
  deleteAppointment: (id: string): boolean => {
    const appointmentIndex = mockAppointments.findIndex((a) => a.id === id);
    if (appointmentIndex === -1) {return false;}
    mockAppointments.splice(appointmentIndex, 1);
    return true;
  },

  /**
   * Confirma um agendamento
   */
  confirmAppointment: (id: string): Appointment | null => {
    return appointmentsService.updateAppointment(id, { status: "scheduled" });
  },

  /**
   * Marca agendamento como concluído
   */
  completeAppointment: (id: string): Appointment | null => {
    return appointmentsService.updateAppointment(id, { status: "completed" });
  },

  /**
   * Cancela agendamento
   */
  cancelAppointment: (id: string): Appointment | null => {
    return appointmentsService.updateAppointment(id, { status: "cancelled" });
  },

  /**
   * Retorna agendamentos com filtros múltiplos
   */
  filterAppointments: (filters: {
    profile?: ProfileType;
    studentId?: string;
    teacherId?: string;
    status?: "scheduled" | "completed" | "cancelled";
    dateFrom?: Date;
    dateTo?: Date;
  }): Appointment[] => {
    try {
      let results = [...mockAppointments];

      if (filters.profile) {
        results = results.filter((a) => a.profile === filters.profile);
      }

      if (filters.studentId) {
        results = results.filter((a) => a.studentId === filters.studentId);
      }

      if (filters.teacherId) {
        results = results.filter((a) => a.teacherId === filters.teacherId);
      }

      if (filters.status) {
        results = results.filter((a) => a.status === filters.status);
      }

      if (filters.dateFrom) {
        results = results.filter((a) => isAfter(a.date, filters.dateFrom!));
      }

      if (filters.dateTo) {
        results = results.filter((a) => isBefore(a.date, filters.dateTo!));
      }

      return appointmentsService._validateAppointments(results);
    } catch (error) {
      console.error("Invalid appointments data:", error);
      return [];
    }
  },

  /**
   * Retorna dados agregados de agendamentos
   */
  getStatistics: () => {
    const total = mockAppointments.length;
    const scheduled = mockAppointments.filter((a) => a.status === "scheduled").length;
    const completed = mockAppointments.filter((a) => a.status === "completed").length;
    const cancelled = mockAppointments.filter((a) => a.status === "cancelled").length;
    const today = appointmentsService.getAppointmentsToday().length;
    const week = appointmentsService.getAppointmentsThisWeek().length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      today,
      week,
    };
  },

  /**
   * Retorna agendamentos agrupados por hora
   */
  getAppointmentsByHour: (date: Date): Record<string, Appointment[]> => {
    const dayAppointments = appointmentsService.getAppointmentsByDate(date);
    const grouped: Record<string, Appointment[]> = {};

    dayAppointments.forEach((apt) => {
      if (!grouped[apt.time]) {
        grouped[apt.time] = [];
      }
      grouped[apt.time].push(apt);
    });

    return grouped;
  },
};
