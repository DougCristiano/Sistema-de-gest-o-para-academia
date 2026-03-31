import { ProfileType, ProfileConfig, PROFILE_NAMES, PROFILE_COLORS } from "../types";
import {
  mockDashboardStats,
  mockPeakHours,
  mockWeeklyAppointments,
  mockMonthlyGrowth,
  mockProfileDistribution,
  mockAttendanceByProfile,
  mockCheckInHistory,
  mockRevenueGrowth,
} from "../data/mockData";
import { ProfileConfigSchema } from "../schemas";

/**
 * Serviço de Perfis
 * Gerencia dados de configuração e análises de perfis de serviço
 * Todos os dados são validados com Zod antes de retornar
 */

export const profilesService = {
  /**
   * Valida dados da configuração de perfil com Zod
   * @throws Error se dados são inválidos
   */
  _validateProfileConfig: (config: unknown): ProfileConfig => {
    return ProfileConfigSchema.parse(config);
  },

  /**
   * Retorna lista de todos os perfis
   */
  getAllProfiles: (): ProfileType[] => {
    return ["huron-areia", "huron-personal", "huron-recovery", "htri", "avitta"];
  },

  /**
   * Retorna nome exibível do perfil
   */
  getProfileName: (profile: ProfileType): string => {
    return PROFILE_NAMES[profile];
  },

  /**
   * Retorna cor do perfil
   */
  getProfileColor: (profile: ProfileType): string => {
    return PROFILE_COLORS[profile];
  },

  /**
   * Retorna estatísticas de um perfil
   */
  getProfileStats: (profile: ProfileType | "all") => {
    return mockDashboardStats[profile] || mockDashboardStats["all"];
  },

  /**
   * Retorna horários de pico de um perfil
   */
  getPeakHours: () => {
    return [...mockPeakHours];
  },

  /**
   * Retorna agendamentos por dia da semana
   */
  getWeeklyAppointments: () => {
    return [...mockWeeklyAppointments];
  },

  /**
   * Retorna crescimento mensal (alunos e receita)
   */
  getMonthlyGrowth: () => {
    return [...mockMonthlyGrowth];
  },

  /**
   * Retorna distribuição de alunos por perfil
   */
  getProfileDistribution: () => {
    return [...mockProfileDistribution];
  },

  /**
   * Retorna taxa de presença por perfil
   */
  getAttendanceByProfile: () => {
    return [...mockAttendanceByProfile];
  },

  /**
   * Retorna histórico de check-ins por mês
   */
  getCheckInHistory: () => {
    return [...mockCheckInHistory];
  },

  /**
   * Retorna crescimento de receita por mês
   */
  getRevenueGrowth: () => {
    return [...mockRevenueGrowth];
  },

  /**
   * Retorna configuração padrão de um perfil (mock)
   */
  getProfileConfig: (profile: ProfileType): ProfileConfig => {
    const config: ProfileConfig = {
      id: `config-${profile}`,
      profile,
      schedule: {
        segunda: {
          enabled: true,
          timeBlocks: [{ id: "tb-1", startTime: "06:00", endTime: "22:00" }],
        },
        terca: {
          enabled: true,
          timeBlocks: [{ id: "tb-2", startTime: "06:00", endTime: "22:00" }],
        },
        quarta: {
          enabled: true,
          timeBlocks: [{ id: "tb-3", startTime: "06:00", endTime: "22:00" }],
        },
        quinta: {
          enabled: true,
          timeBlocks: [{ id: "tb-4", startTime: "06:00", endTime: "22:00" }],
        },
        sexta: {
          enabled: true,
          timeBlocks: [{ id: "tb-5", startTime: "06:00", endTime: "22:00" }],
        },
        sabado: {
          enabled: true,
          timeBlocks: [{ id: "tb-6", startTime: "08:00", endTime: "18:00" }],
        },
        domingo: {
          enabled: false,
          timeBlocks: [],
        },
      },
      maxStudentsPerSlot: 15,
      classDuration: 60,
      breakBetweenClasses: 15,
      allowGroupClasses: true,
      maxGroupSize: 20,
      autoConfirmBookings: true,
      cancellationDeadline: 24,
      allowWaitlist: true,
      notes: "Configurações padrão do perfil",
    };

    try {
      return profilesService._validateProfileConfig(config);
    } catch (error) {
      console.error("Invalid profile config:", error);
      return config;
    }
  },

  /**
   * Atualiza configuração de um perfil (mock)
   */
  updateProfileConfig: (profile: ProfileType, config: Partial<ProfileConfig>): ProfileConfig => {
    const currentConfig = profilesService.getProfileConfig(profile);
    const updatedConfig = { ...currentConfig, ...config };

    try {
      return profilesService._validateProfileConfig(updatedConfig);
    } catch (error) {
      console.error("Invalid profile config on update:", error);
      return updatedConfig;
    }
  },

  /**
   * Retorna informações resumidas de todos os perfis
   */
  getProfilesSummary: () => {
    return profilesService.getAllProfiles().map((profile) => ({
      profile,
      name: profilesService.getProfileName(profile),
      color: profilesService.getProfileColor(profile),
      stats: profilesService.getProfileStats(profile),
    }));
  },

  /**
   * Valida se um perfil existe
   */
  isValidProfile: (profile: ProfileType | string): profile is ProfileType => {
    const validProfiles: ProfileType[] = [
      "huron-areia",
      "huron-personal",
      "huron-recovery",
      "htri",
      "avitta",
    ];
    return validProfiles.includes(profile as ProfileType);
  },

  /**
   * Retorna lista de perfis como opções para Select
   */
  getProfilesAsOptions: () => {
    return profilesService.getAllProfiles().map((profile) => ({
      value: profile,
      label: profilesService.getProfileName(profile),
      color: profilesService.getProfileColor(profile),
    }));
  },
};
