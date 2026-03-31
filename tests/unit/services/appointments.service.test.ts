import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appointmentsService } from "@/services/appointments.service";
import { mockAppointments } from "@/data/mockData";

describe("appointmentsService", () => {
  let originalAppointments: typeof mockAppointments;

  beforeEach(() => {
    originalAppointments = JSON.parse(JSON.stringify(mockAppointments));
  });

  afterEach(() => {
    mockAppointments.length = 0;
    mockAppointments.push(...originalAppointments);
  });

  describe("getAllAppointments", () => {
    it("should return all appointments", () => {
      const result = appointmentsService.getAllAppointments();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return validated appointments", () => {
      const result = appointmentsService.getAllAppointments();
      result.forEach((apt) => {
        expect(apt.id).toBeDefined();
        expect(apt.status).toMatch(/scheduled|completed|cancelled/);
        expect(apt.studentId).toBeDefined();
        expect(apt.teacherId).toBeDefined();
      });
    });
  });

  describe("getAppointmentById", () => {
    it("should return appointment by valid ID", () => {
      const appointment = mockAppointments[0];
      const result = appointmentsService.getAppointmentById(appointment.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(appointment.id);
    });

    it("should return null for invalid ID", () => {
      const result = appointmentsService.getAppointmentById("invalid-id");
      expect(result).toBeNull();
    });
  });

  describe("getAppointmentsByStudent", () => {
    it("should return only appointments for specific student", () => {
      const appointment = mockAppointments[0];
      const result = appointmentsService.getAppointmentsByStudent(appointment.studentId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((apt) => {
        expect(apt.studentId).toBe(appointment.studentId);
      });
    });
  });

  describe("getAppointmentsByTeacher", () => {
    it("should return only appointments for specific teacher", () => {
      const appointment = mockAppointments[0];
      const result = appointmentsService.getAppointmentsByTeacher(appointment.teacherId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((apt) => {
        expect(apt.teacherId).toBe(appointment.teacherId);
      });
    });
  });

  describe("getAppointmentsByStatus", () => {
    it("should return only scheduled appointments", () => {
      const result = appointmentsService.getAppointmentsByStatus("scheduled");
      result.forEach((apt) => {
        expect(apt.status).toBe("scheduled");
      });
    });

    it("should return only completed appointments", () => {
      const result = appointmentsService.getAppointmentsByStatus("completed");
      result.forEach((apt) => {
        expect(apt.status).toBe("completed");
      });
    });

    it("should return only cancelled appointments", () => {
      const result = appointmentsService.getAppointmentsByStatus("cancelled");
      result.forEach((apt) => {
        expect(apt.status).toBe("cancelled");
      });
    });
  });

  describe("createAppointment", () => {
    it("should create new appointment with generated ID", () => {
      const newAptData = {
        studentId: "student-1",
        studentName: "Test Student",
        teacherId: "teacher-1",
        teacherName: "Test Teacher",
        profile: "huron-areia" as const,
        date: new Date("2024-04-15"),
        time: "14:00",
        duration: 60,
        status: "scheduled" as const,
      };

      const initialCount = mockAppointments.length;
      const result = appointmentsService.createAppointment(newAptData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.studentId).toBe(newAptData.studentId);
      expect(mockAppointments.length).toBe(initialCount + 1);
    });
  });

  describe("updateAppointment", () => {
    it("should update existing appointment status", () => {
      const appointment = mockAppointments[0];
      const newStatus = appointment.status === "scheduled" ? "completed" : "scheduled";

      const result = appointmentsService.updateAppointment(appointment.id, {
        status: newStatus,
      });

      expect(result).toBeDefined();
      expect(result?.status).toBe(newStatus);
      expect(result?.id).toBe(appointment.id);
    });

    it("should return null for invalid appointment ID", () => {
      const result = appointmentsService.updateAppointment("invalid-id", {
        status: "completed",
      });
      expect(result).toBeNull();
    });
  });

  describe("completeAppointment", () => {
    it("should mark appointment as completed", () => {
      const appointment = mockAppointments.find((a) => a.status === "scheduled");
      if (appointment) {
        const result = appointmentsService.completeAppointment(appointment.id);
        expect(result?.status).toBe("completed");
      }
    });
  });

  describe("cancelAppointment", () => {
    it("should mark appointment as cancelled", () => {
      const appointment = mockAppointments.find((a) => a.status === "scheduled");
      if (appointment) {
        const result = appointmentsService.cancelAppointment(appointment.id);
        expect(result?.status).toBe("cancelled");
      }
    });
  });

  describe("filterAppointments", () => {
    it("should filter by profile", () => {
      const appointment = mockAppointments[0];
      const result = appointmentsService.filterAppointments({
        profile: appointment.profile,
      });

      result.forEach((apt) => {
        expect(apt.profile).toBe(appointment.profile);
      });
    });

    it("should filter by status", () => {
      const result = appointmentsService.filterAppointments({
        status: "scheduled",
      });

      result.forEach((apt) => {
        expect(apt.status).toBe("scheduled");
      });
    });

    it("should filter by multiple criteria", () => {
      const appointment = mockAppointments[0];
      const result = appointmentsService.filterAppointments({
        profile: appointment.profile,
        status: "scheduled",
      });

      result.forEach((apt) => {
        expect(apt.profile).toBe(appointment.profile);
        expect(apt.status).toBe("scheduled");
      });
    });
  });

  describe("getStatistics", () => {
    it("should return statistics with correct structure", () => {
      const result = appointmentsService.getStatistics();

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.scheduled).toBeGreaterThanOrEqual(0);
      expect(result.completed).toBeGreaterThanOrEqual(0);
      expect(result.cancelled).toBeGreaterThanOrEqual(0);
      expect(result.today).toBeGreaterThanOrEqual(0);
      expect(result.week).toBeGreaterThanOrEqual(0);

      const sum = result.scheduled + result.completed + result.cancelled;
      expect(sum).toBe(result.total);
    });
  });

  describe("deleteAppointment", () => {
    it("should delete appointment successfully", () => {
      const initialCount = mockAppointments.length;
      const appointment = mockAppointments[0];

      const result = appointmentsService.deleteAppointment(appointment.id);
      expect(result).toBe(true);
      expect(mockAppointments.length).toBe(initialCount - 1);
    });

    it("should return false for invalid ID", () => {
      const result = appointmentsService.deleteAppointment("invalid-id");
      expect(result).toBe(false);
    });
  });
});
