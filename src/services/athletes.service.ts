import { mockAthletes, MockAthlete } from "../data/mockData";
import { ProfileType } from "../types";
import { AthleteSchema } from "../schemas";

/**
 * Serviço de Atletas
 * Gerencia operações de atletas inscritos (alunos com dados de treino)
 * Todos os dados são validados com Zod antes de retornar
 */

export const athletesService = {
  /**
   * Valida dados do atleta com Zod
   * @throws Error se dados são inválidos
   */
  _validateAthlete: (athlete: unknown): MockAthlete => {
    return AthleteSchema.parse(athlete);
  },

  /**
   * Valida e filtra array de atletas
   */
  _validateAthletes: (athletes: unknown[]): MockAthlete[] => {
    return athletes.map((a) => athletesService._validateAthlete(a));
  },

  /**
   * Retorna todos os atletas
   */
  getAllAthletes: (): MockAthlete[] => {
    try {
      return athletesService._validateAthletes(mockAthletes);
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Retorna atleta por ID
   */
  getAthleteById: (id: string): MockAthlete | null => {
    const athlete = mockAthletes.find((a) => a.id === id);
    if (!athlete) {return null;}
    try {
      return athletesService._validateAthlete(athlete);
    } catch (error) {
      console.error("Invalid athlete data:", error);
      return null;
    }
  },

  /**
   * Retorna atleta por email (user correspondente)
   */
  getAthleteByEmail: (email: string): MockAthlete | null => {
    const athlete = mockAthletes.find((a) => a.email === email);
    if (!athlete) {return null;}
    try {
      return athletesService._validateAthlete(athlete);
    } catch (error) {
      console.error("Invalid athlete data:", error);
      return null;
    }
  },

  /**
   * Retorna atletas de um perfil específico
   */
  getAthletesByProfile: (profile: ProfileType): MockAthlete[] => {
    try {
      return athletesService._validateAthletes(mockAthletes.filter((a) => a.profile === profile));
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Retorna atletas por status (ativo, inativo, pendente)
   */
  getAthletesByStatus: (status: "ativo" | "inativo" | "pendente"): MockAthlete[] => {
    try {
      return athletesService._validateAthletes(mockAthletes.filter((a) => a.status === status));
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Retorna atletas de um professor específico
   */
  getAthletesByTeacher: (teacherName: string): MockAthlete[] => {
    try {
      return athletesService._validateAthletes(
        mockAthletes.filter((a) => a.teacher === teacherName)
      );
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Retorna atletas ativos no momento
   */
  getAthletsTrainingNow: (): MockAthlete[] => {
    try {
      return athletesService._validateAthletes(mockAthletes.filter((a) => a.isTrainingNow));
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Busca atletas por termo (nome, email, teacher)
   */
  searchAthletes: (searchTerm: string): MockAthlete[] => {
    try {
      const term = searchTerm.toLowerCase();
      const filtered = mockAthletes.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.teacher.toLowerCase().includes(term)
      );
      return athletesService._validateAthletes(filtered);
    } catch (error) {
      console.error("Invalid athletes data:", error);
      return [];
    }
  },

  /**
   * Cria novo atleta (mock)
   */
  createAthlete: (athleteData: Omit<MockAthlete, "id">): MockAthlete => {
    const newId = `ath-${Date.now()}`;
    const newAthlete: MockAthlete = {
      ...athleteData,
      id: newId,
    };
    try {
      const validatedAthlete = athletesService._validateAthlete(newAthlete);
      mockAthletes.push(validatedAthlete);
      return validatedAthlete;
    } catch (error) {
      console.error("Invalid athlete data on creation:", error);
      throw error;
    }
  },

  /**
   * Atualiza atleta existente
   */
  updateAthlete: (id: string, updates: Partial<MockAthlete>): MockAthlete | null => {
    const athleteIndex = mockAthletes.findIndex((a) => a.id === id);
    if (athleteIndex === -1) {return null;}

    const updatedAthlete = { ...mockAthletes[athleteIndex], ...updates };
    try {
      const validatedAthlete = athletesService._validateAthlete(updatedAthlete);
      mockAthletes[athleteIndex] = validatedAthlete;
      return validatedAthlete;
    } catch (error) {
      console.error("Invalid athlete data on update:", error);
      return null;
    }
  },

  /**
   * Deleta atleta (mock)
   */
  deleteAthlete: (id: string): boolean => {
    const athleteIndex = mockAthletes.findIndex((a) => a.id === id);
    if (athleteIndex === -1) {return false;}
    mockAthletes.splice(athleteIndex, 1);
    return true;
  },

  /**
   * Calcula estatísticas agregadas de atletas
   */
  getStatistics: () => {
    const total = mockAthletes.length;
    const active = mockAthletes.filter((a) => a.status === "ativo").length;
    const inactive = mockAthletes.filter((a) => a.status === "inativo").length;
    const pending = mockAthletes.filter((a) => a.status === "pendente").length;
    const trainingNow = mockAthletes.filter((a) => a.isTrainingNow).length;

    const avgSessions =
      mockAthletes.length > 0
        ? Math.round(mockAthletes.reduce((sum, a) => sum + a.totalSessions, 0) / total)
        : 0;

    const avgCompletionRate =
      mockAthletes.length > 0
        ? Math.round(
            (mockAthletes.reduce((sum, a) => sum + a.completedSessions, 0) /
              mockAthletes.reduce((sum, a) => sum + a.totalSessions, 0)) *
              100
          )
        : 0;

    return {
      total,
      active,
      inactive,
      pending,
      trainingNow,
      avgSessions,
      avgCompletionRate,
    };
  },

  /**
   * Retorna atletas com check-in baixo (menos de 50% do esperado no mês)
   */
  getAthletsWithLowCheckIns: (threshold = 50): MockAthlete[] => {
    return mockAthletes.filter((a) => {
      const planLimits: Record<string, number> = {
        mensal: 20,
        trimestral: 20,
        semestral: 22,
        anual: 24,
      };
      const limit = planLimits[a.plan] || 20;
      const percentage = (a.checkInsThisMonth / limit) * 100;
      return percentage < threshold;
    });
  },

  /**
   * Retorna atletas com melhor índice de presença (streak)
   */
  getTopAthletesByStreak: (limit = 10): MockAthlete[] => {
    return [...mockAthletes].sort((a, b) => b.streak - a.streak).slice(0, limit);
  },

  /**
   * Retorna distribuição de atletas por perfil
   */
  getAthleteDistributionByProfile: (): Record<ProfileType, number> => {
    const distribution: Record<ProfileType, number> = {
      "huron-areia": 0,
      "huron-personal": 0,
      "huron-recovery": 0,
      htri: 0,
      avitta: 0,
    };

    mockAthletes.forEach((a) => {
      distribution[a.profile]++;
    });

    return distribution;
  },
};
