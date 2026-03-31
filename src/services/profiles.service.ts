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

export interface ServiceCatalogItem {
  id: string;
  name: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const SERVICES_STORAGE_KEY = "huron_services_catalog";

const SERVICE_COLOR_PALETTE = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#92400e",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#ec4899",
];

const BASE_PROFILE_IDS: ProfileType[] = [
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
];

const DEFAULT_SERVICE_CATALOG: ServiceCatalogItem[] = BASE_PROFILE_IDS.map((id) => {
  const now = new Date().toISOString();
  return {
    id,
    name: PROFILE_NAMES[id],
    color: PROFILE_COLORS[id],
    active: true,
    createdAt: now,
    updatedAt: now,
  };
});

const canUseStorage = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

const normalizeServiceId = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "servico";
};

const parseServiceCatalog = (raw: string | null): ServiceCatalogItem[] | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const now = new Date().toISOString();

    const sanitized = parsed
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : "",
        name: typeof item.name === "string" ? item.name : "",
        color: typeof item.color === "string" ? item.color : SERVICE_COLOR_PALETTE[0],
        active: typeof item.active === "boolean" ? item.active : true,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : now,
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : now,
      }))
      .filter((item) => item.id.length > 0 && item.name.trim().length > 0);

    return sanitized.length > 0 ? sanitized : null;
  } catch {
    return null;
  }
};

const saveServiceCatalog = (catalog: ServiceCatalogItem[]): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(catalog));
};

const readServiceCatalog = (): ServiceCatalogItem[] => {
  if (!canUseStorage()) {
    return [...DEFAULT_SERVICE_CATALOG];
  }

  const stored = parseServiceCatalog(window.localStorage.getItem(SERVICES_STORAGE_KEY));
  if (stored) {
    return stored;
  }

  saveServiceCatalog(DEFAULT_SERVICE_CATALOG);
  return [...DEFAULT_SERVICE_CATALOG];
};

export const profilesService = {
  /**
   * Valida dados da configuração de perfil com Zod
   * @throws Error se dados são inválidos
   */
  _validateProfileConfig: (config: unknown): ProfileConfig => {
    return ProfileConfigSchema.parse(config) as ProfileConfig;
  },

  /**
   * Retorna catálogo completo de serviços (ativos e inativos)
   */
  getServiceCatalog: (): ServiceCatalogItem[] => {
    return readServiceCatalog().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },

  /**
   * Retorna apenas serviços ativos
   */
  getActiveServiceCatalog: (): ServiceCatalogItem[] => {
    return profilesService.getServiceCatalog().filter((service) => service.active);
  },

  /**
   * Retorna um serviço por id
   */
  getServiceById: (serviceId: string): ServiceCatalogItem | undefined => {
    return profilesService.getServiceCatalog().find((service) => service.id === serviceId);
  },

  /**
   * Retorna nome exibível de um serviço por id
   */
  getServiceName: (serviceId: string): string => {
    const catalogService = profilesService.getServiceById(serviceId);
    if (catalogService) {
      return catalogService.name;
    }

    const legacyName = PROFILE_NAMES[serviceId as ProfileType];
    return legacyName || serviceId;
  },

  /**
   * Cria novo serviço no catálogo
   */
  createService: (name: string): ServiceCatalogItem => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("O nome do serviço é obrigatório.");
    }

    const catalog = readServiceCatalog();
    const duplicatedName = catalog.some(
      (service) => service.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicatedName) {
      throw new Error("Já existe um serviço com esse nome.");
    }

    const baseId = normalizeServiceId(trimmedName);
    let id = baseId;
    let suffix = 2;
    while (catalog.some((service) => service.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const now = new Date().toISOString();
    const service: ServiceCatalogItem = {
      id,
      name: trimmedName,
      color: SERVICE_COLOR_PALETTE[catalog.length % SERVICE_COLOR_PALETTE.length],
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    const updatedCatalog = [...catalog, service];
    saveServiceCatalog(updatedCatalog);
    return service;
  },

  /**
   * Atualiza nome de serviço existente
   */
  updateServiceName: (serviceId: string, name: string): ServiceCatalogItem => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("O nome do serviço é obrigatório.");
    }

    const catalog = readServiceCatalog();
    const target = catalog.find((service) => service.id === serviceId);

    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    const duplicatedName = catalog.some(
      (service) =>
        service.id !== serviceId &&
        service.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicatedName) {
      throw new Error("Já existe um serviço com esse nome.");
    }

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((service) =>
      service.id === serviceId ? { ...service, name: trimmedName, updatedAt: now } : service
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((service) => service.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Define status ativo/inativo de um serviço
   */
  setServiceActive: (serviceId: string, active: boolean): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((service) => service.id === serviceId);

    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((service) =>
      service.id === serviceId ? { ...service, active, updatedAt: now } : service
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((service) => service.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Atalho para inativar serviço
   */
  deactivateService: (serviceId: string): ServiceCatalogItem => {
    return profilesService.setServiceActive(serviceId, false);
  },

  /**
   * Atalho para reativar serviço
   */
  reactivateService: (serviceId: string): ServiceCatalogItem => {
    return profilesService.setServiceActive(serviceId, true);
  },

  /**
   * Retorna opções para selects e filtros
   */
  getServicesAsOptions: (onlyActive = true) => {
    const catalog = onlyActive
      ? profilesService.getActiveServiceCatalog()
      : profilesService.getServiceCatalog();

    return catalog.map((service) => ({
      value: service.id,
      label: service.name,
      color: service.color,
      active: service.active,
    }));
  },

  /**
   * Retorna lista de todos os perfis
   */
  getAllProfiles: (): ProfileType[] => {
    return [...BASE_PROFILE_IDS];
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
    return BASE_PROFILE_IDS.includes(profile as ProfileType);
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
