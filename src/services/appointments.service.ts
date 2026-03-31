import { Appointment, ProfileType } from "../types";
import { mockAppointments } from "../data/mockData";
import { isSameDay, isAfter, isBefore } from "date-fns";

/**
 * Serviço de Agendamentos
 * Gerencia operações de agendamentos e aulas
 */

export const appointmentsService = {
  /**
   * Retorna todos os agendamentos
   */
  getAllAppointments: (): Appointment[] => {
    return [...mockAppointments];
  },

  /**
   * Retorna agendamento por ID
   */
  getAppointmentById: (id: string): Appointment | null => {
    return mockAppointments.find((a) => a.id === id) || null;
  },

  /**
   * Retorna agendamentos de um aluno
   */
  getAppointmentsByStudent: (studentId: string): Appointment[] => {
    return mockAppointments.filter((a) => a.studentId === studentId);
  },

  /**
   * Retorna agendamentos de um professor
   */
  getAppointmentsByTeacher: (teacherId: string): Appointment[] => {
    return mockAppointments.filter((a) => a.teacherId === teacherId);
  },

  /**
   * Retorna agendamentos de um perfil específico
   */
  getAppointmentsByProfile: (profile: ProfileType): Appointment[] => {
    return mockAppointments.filter((a) => a.profile === profile);
  },

  /**
   * Retorna agendamentos de um dia específico
   */
  getAppointmentsByDate: (date: Date): Appointment[] => {
    return mockAppointments.filter((a) => isSameDay(a.date, date));
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
    const now = new Date();
    return mockAppointments
      .filter((a) => isAfter(a.date, now) && a.status === "scheduled")
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  },

  /**
   * Retorna agendamentos por status
   */
  getAppointmentsByStatus: (
    status: "scheduled" | "completed" | "cancelled"
  ): Appointment[] => {
    return mockAppointments.filter((a) => a.status === status);
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
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  /**
   * Atualiza agendamento existente
   */
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ): Appointment | null => {
    const appointmentIndex = mockAppointments.findIndex((a) => a.id === id);
    if (appointmentIndex === -1) return null;

    const updatedAppointment = { ...mockAppointments[appointmentIndex], ...updates };
    mockAppointments[appointmentIndex] = updatedAppointment;
    return updatedAppointment;
  },

  /**
   * Deleta agendamento (mock)
   */
  deleteAppointment: (id: string): boolean => {
    const appointmentIndex = mockAppointments.findIndex((a) => a.id === id);
    if (appointmentIndex === -1) return false;
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
  filterAppointments: (
    filters: {
      profile?: ProfileType;
      studentId?: string;
      teacherId?: string;
      status?: "scheduled" | "completed" | "cancelled";
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Appointment[] => {
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

    return results;
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
