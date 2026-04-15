import { ProfileType, ProfileConfig, PROFILE_NAMES, PROFILE_COLORS, Activity } from "../types";
export type { Activity };
import {
  mockDashboardStats,
  mockPeakHours,
  mockWeeklyAppointments,
  mockMonthlyGrowth,
  mockProfileDistribution,
  mockAttendanceByProfile,
  mockCheckInHistory,
  mockRevenueGrowth,
  mockUsers,
} from "../data/mockData";
import { ProfileConfigSchema } from "../schemas";

/**
 * Serviço de Perfis
 * Gerencia dados de configuração e análises de perfis de serviço
 * Todos os dados são validados com Zod antes de retornar
 */

export type ServiceWeekDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface ServiceTeacherDaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  maxStudents: number;
}

export interface ClassSlotOverride {
  id: string;
  teacherId: string;
  date: string; // "YYYY-MM-DD"
  maxStudents: number | null; // null = blocked for this date
  notes?: string;
}

export type ServiceTeacherSchedule = Record<ServiceWeekDayKey, ServiceTeacherDaySchedule>;

export interface ServiceTeacherAssignment {
  teacherId: string;
  activityIds: string[];
  schedule: ServiceTeacherSchedule;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  color: string;
  active: boolean;
  managerId: string | null;
  activities: Activity[];
  teachers: ServiceTeacherAssignment[];
  overrides: ClassSlotOverride[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceManagerOption {
  value: string;
  label: string;
  email: string;
}

export interface ServiceTeacherOption {
  value: string;
  label: string;
  email: string;
}

export const SERVICE_WEEK_DAYS: Array<{
  key: ServiceWeekDayKey;
  label: string;
  shortLabel: string;
}> = [
  { key: "monday", label: "Segunda", shortLabel: "Seg" },
  { key: "tuesday", label: "Terca", shortLabel: "Ter" },
  { key: "wednesday", label: "Quarta", shortLabel: "Qua" },
  { key: "thursday", label: "Quinta", shortLabel: "Qui" },
  { key: "friday", label: "Sexta", shortLabel: "Sex" },
  { key: "saturday", label: "Sabado", shortLabel: "Sab" },
  { key: "sunday", label: "Domingo", shortLabel: "Dom" },
];

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

const DEFAULT_MANAGER_BY_PROFILE: Partial<Record<ProfileType, string>> = mockUsers
  .filter((user) => user.role === "manager")
  .reduce(
    (acc, manager) => {
      manager.profiles.forEach((profile) => {
        if (!acc[profile]) {
          acc[profile] = manager.id;
        }
      });
      return acc;
    },
    {} as Partial<Record<ProfileType, string>>
  );

const DEFAULT_ACTIVITIES_BY_SERVICE: Record<string, Activity[]> = {
  "huron-areia": [
    { id: "huron-areia-futevolei", name: "Futevolei" },
    { id: "huron-areia-volei-de-praia", name: "Vôlei de Praia" },
    { id: "huron-areia-beach-tennis", name: "Beach Tennis" },
  ],
  "huron-personal": [
    { id: "huron-personal-musculacao", name: "Musculação" },
    { id: "huron-personal-crossfit", name: "Crossfit" },
    { id: "huron-personal-pilates", name: "Pilates" },
  ],
  "huron-recovery": [
    { id: "huron-recovery-fisioterapia", name: "Fisioterapia" },
    { id: "huron-recovery-pilates-clinico", name: "Pilates Clínico" },
  ],
  "htri": [
    { id: "htri-treinamento-funcional", name: "Treinamento Funcional" },
  ],
  "avitta": [
    { id: "avitta-natacao", name: "Natação" },
    { id: "avitta-hidroginastica", name: "Hidroginástica" },
  ],
};

const DEFAULT_SERVICE_CATALOG: ServiceCatalogItem[] = BASE_PROFILE_IDS.map((id) => {
  const now = new Date().toISOString();
  return {
    id,
    name: PROFILE_NAMES[id],
    color: PROFILE_COLORS[id],
    active: true,
    managerId: DEFAULT_MANAGER_BY_PROFILE[id] || null,
    activities: DEFAULT_ACTIVITIES_BY_SERVICE[id] || [],
    teachers: [],
    overrides: [],
    createdAt: now,
    updatedAt: now,
  };
});

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

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

export const createDefaultTeacherSchedule = (): ServiceTeacherSchedule => ({
  monday: { enabled: true, startTime: "06:00", endTime: "22:00", maxStudents: 10 },
  tuesday: { enabled: true, startTime: "06:00", endTime: "22:00", maxStudents: 10 },
  wednesday: { enabled: true, startTime: "06:00", endTime: "22:00", maxStudents: 10 },
  thursday: { enabled: true, startTime: "06:00", endTime: "22:00", maxStudents: 10 },
  friday: { enabled: true, startTime: "06:00", endTime: "22:00", maxStudents: 10 },
  saturday: { enabled: true, startTime: "08:00", endTime: "14:00", maxStudents: 10 },
  sunday: { enabled: false, startTime: "08:00", endTime: "12:00", maxStudents: 10 },
});

const sanitizeTime = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && TIME_PATTERN.test(value)) {
    return value;
  }

  return fallback;
};

const cloneTeacherSchedule = (schedule: ServiceTeacherSchedule): ServiceTeacherSchedule => {
  return SERVICE_WEEK_DAYS.reduce((acc, day) => {
    acc[day.key] = { ...schedule[day.key] };
    return acc;
  }, {} as ServiceTeacherSchedule);
};

const sanitizeTeacherSchedule = (value: unknown): ServiceTeacherSchedule => {
  const defaultSchedule = createDefaultTeacherSchedule();

  if (!value || typeof value !== "object") {
    return defaultSchedule;
  }

  const candidate = value as Partial<Record<ServiceWeekDayKey, Partial<ServiceTeacherDaySchedule>>>;

  return SERVICE_WEEK_DAYS.reduce((acc, day) => {
    const candidateDay = candidate[day.key];
    const fallback = defaultSchedule[day.key];

    const rawMax = (candidateDay as Record<string, unknown> | undefined)?.maxStudents;
    acc[day.key] = {
      enabled:
        typeof candidateDay?.enabled === "boolean" ? candidateDay.enabled : fallback.enabled,
      startTime: sanitizeTime(candidateDay?.startTime, fallback.startTime),
      endTime: sanitizeTime(candidateDay?.endTime, fallback.endTime),
      maxStudents:
        typeof rawMax === "number" && Number.isFinite(rawMax) && rawMax >= 1
          ? Math.floor(rawMax)
          : fallback.maxStudents,
    };

    return acc;
  }, {} as ServiceTeacherSchedule);
};

const sanitizeTeacherAssignments = (value: unknown): ServiceTeacherAssignment[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenTeacherIds = new Set<string>();

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      teacherId: typeof item.teacherId === "string" ? item.teacherId : "",
      activityIds: Array.isArray(item.activityIds)
        ? item.activityIds.filter((id): id is string => typeof id === "string")
        : [],
      schedule: sanitizeTeacherSchedule(item.schedule),
    }))
    .filter((assignment) => {
      if (!assignment.teacherId || seenTeacherIds.has(assignment.teacherId)) {
        return false;
      }

      seenTeacherIds.add(assignment.teacherId);
      return true;
    });
};

const cloneTeacherAssignments = (
  teachers: ServiceTeacherAssignment[]
): ServiceTeacherAssignment[] => {
  return teachers.map((assignment) => ({
    teacherId: assignment.teacherId,
    activityIds: [...assignment.activityIds],
    schedule: cloneTeacherSchedule(assignment.schedule),
  }));
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
      .map((item) => {
        const id = typeof item.id === "string" ? item.id : "";
        const rawActivities = Array.isArray(item.activities)
          ? item.activities
              .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
              .map((a) => ({
                id: typeof a.id === "string" ? a.id : "",
                name: typeof a.name === "string" ? a.name : "",
              }))
              .filter((a) => a.id.length > 0 && a.name.trim().length > 0)
          : DEFAULT_ACTIVITIES_BY_SERVICE[id] || [];
        const rawOverrides = Array.isArray(item.overrides) ? item.overrides : [];
        const parsedOverrides: ClassSlotOverride[] = rawOverrides
          .filter((o): o is Record<string, unknown> => !!o && typeof o === "object")
          .map((o) => ({
            id: typeof o.id === "string" ? o.id : "",
            teacherId: typeof o.teacherId === "string" ? o.teacherId : "",
            date: typeof o.date === "string" ? o.date : "",
            maxStudents:
              typeof o.maxStudents === "number" && o.maxStudents >= 1
                ? Math.floor(o.maxStudents as number)
                : null,
            notes: typeof o.notes === "string" ? o.notes : undefined,
          }))
          .filter((o) => o.id.length > 0 && o.teacherId.length > 0 && o.date.length > 0);

        return {
          id,
          name: typeof item.name === "string" ? item.name : "",
          color: typeof item.color === "string" ? item.color : SERVICE_COLOR_PALETTE[0],
          active: typeof item.active === "boolean" ? item.active : true,
          managerId: typeof item.managerId === "string" ? item.managerId : null,
          activities: rawActivities,
          teachers: sanitizeTeacherAssignments(item.teachers),
          overrides: parsedOverrides,
          createdAt: typeof item.createdAt === "string" ? item.createdAt : now,
          updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : now,
        };
      })
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
   * Lista managers para seleção
   */
  getManagerOptions: (): ServiceManagerOption[] => {
    return mockUsers
      .filter((user) => user.role === "manager")
      .map((manager) => ({
        value: manager.id,
        label: manager.name,
        email: manager.email,
      }));
  },

  /**
   * Lista professores para seleção
   */
  getTeacherOptions: (): ServiceTeacherOption[] => {
    return mockUsers
      .filter((user) => user.role === "teacher")
      .map((teacher) => ({
        value: teacher.id,
        label: teacher.name,
        email: teacher.email,
      }));
  },

  /**
   * Retorna nome do manager responsável por um serviço
   */
  getServiceManagerName: (serviceId: string): string | null => {
    const service = profilesService.getServiceById(serviceId);
    if (!service || !service.managerId) {
      return null;
    }

    const manager = mockUsers.find((user) => user.id === service.managerId && user.role === "manager");
    return manager ? manager.name : null;
  },

  /**
   * Retorna nome do professor por id
   */
  getTeacherName: (teacherId: string): string | null => {
    const teacher = mockUsers.find((user) => user.id === teacherId && user.role === "teacher");
    return teacher ? teacher.name : null;
  },

  /**
   * Retorna atividades de um serviço
   */
  getActivitiesByService: (serviceId: string): Activity[] => {
    const service = profilesService.getServiceById(serviceId);
    return service ? [...service.activities] : [];
  },

  /**
   * Cria nova atividade em um serviço
   */
  createActivity: (serviceId: string, name: string): ServiceCatalogItem => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("O nome da atividade é obrigatório.");
    }

    const catalog = readServiceCatalog();
    const target = catalog.find((s) => s.id === serviceId);
    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    const duplicate = target.activities.some(
      (a) => a.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw new Error("Já existe uma atividade com esse nome neste serviço.");
    }

    const baseId = normalizeServiceId(trimmedName);
    let id = `${serviceId}-${baseId}`;
    let suffix = 2;
    while (target.activities.some((a) => a.id === id)) {
      id = `${serviceId}-${baseId}-${suffix}`;
      suffix += 1;
    }

    const newActivity: Activity = { id, name: trimmedName };
    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((s) =>
      s.id === serviceId
        ? { ...s, activities: [...s.activities, newActivity], updatedAt: now }
        : s
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((s) => s.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Remove atividade de um serviço e limpa referências em professores
   */
  deleteActivity: (serviceId: string, activityId: string): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((s) => s.id === serviceId);
    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((s) =>
      s.id === serviceId
        ? {
            ...s,
            activities: s.activities.filter((a) => a.id !== activityId),
            teachers: s.teachers.map((t) => ({
              ...t,
              activityIds: t.activityIds.filter((id) => id !== activityId),
            })),
            updatedAt: now,
          }
        : s
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((s) => s.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Lista ids dos serviços geridos por um manager
   */
  getManagedServiceIds: (managerId: string, includeInactive = false): string[] => {
    const catalog = includeInactive
      ? profilesService.getServiceCatalog()
      : profilesService.getActiveServiceCatalog();

    return catalog.filter((service) => service.managerId === managerId).map((service) => service.id);
  },

  /**
   * Retorna lista de professores e horários de um serviço
   */
  getServiceTeachers: (serviceId: string): ServiceTeacherAssignment[] => {
    const service = profilesService.getServiceById(serviceId);
    if (!service) {
      return [];
    }

    return cloneTeacherAssignments(service.teachers);
  },

  /**
   * Retorna serviços atribuídos a um professor com seus horários
   */
  getTeacherServiceSchedules: (teacherId: string, onlyActive = true) => {
    const catalog = onlyActive
      ? profilesService.getActiveServiceCatalog()
      : profilesService.getServiceCatalog();

    return catalog.reduce<Array<{ service: ServiceCatalogItem; schedule: ServiceTeacherSchedule }>>(
      (acc, service) => {
        const assignment = service.teachers.find((teacher) => teacher.teacherId === teacherId);
        if (!assignment) {
          return acc;
        }

        acc.push({
          service,
          schedule: cloneTeacherSchedule(assignment.schedule),
        });

        return acc;
      },
      []
    );
  },

  /**
   * Define manager responsável por um serviço
   */
  setServiceManager: (serviceId: string, managerId: string | null): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((service) => service.id === serviceId);

    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    if (managerId) {
      const managerExists = mockUsers.some((user) => user.id === managerId && user.role === "manager");
      if (!managerExists) {
        throw new Error("Manager inválido para associação.");
      }
    }

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((service) =>
      service.id === serviceId ? { ...service, managerId, updatedAt: now } : service
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((service) => service.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Atualiza lista de professores e horários de um serviço
   */
  setServiceTeachers: (
    serviceId: string,
    teachers: ServiceTeacherAssignment[]
  ): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((service) => service.id === serviceId);

    if (!target) {
      throw new Error("Serviço não encontrado.");
    }

    const validTeacherIds = new Set(profilesService.getTeacherOptions().map((teacher) => teacher.value));
    const normalizedTeachers = sanitizeTeacherAssignments(teachers).map((assignment) => {
      if (!validTeacherIds.has(assignment.teacherId)) {
        throw new Error("Professor inválido para associação.");
      }

      return {
        teacherId: assignment.teacherId,
        activityIds: [...assignment.activityIds],
        schedule: cloneTeacherSchedule(assignment.schedule),
      };
    });

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((service) =>
      service.id === serviceId ? { ...service, teachers: normalizedTeachers, updatedAt: now } : service
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((service) => service.id === serviceId) as ServiceCatalogItem;
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
      managerId: null,
      activities: [],
      teachers: [],
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
      managerId: service.managerId,
    }));
  },

  /**
   * Retorna exceções pontuais de um serviço, opcionalmente filtradas por professor
   */
  getClassSlotOverrides: (serviceId: string, teacherId?: string): ClassSlotOverride[] => {
    const service = profilesService.getServiceById(serviceId);
    if (!service) { return []; }
    const overrides = service.overrides || [];
    return teacherId ? overrides.filter((o) => o.teacherId === teacherId) : [...overrides];
  },

  /**
   * Adiciona exceção pontual a um serviço
   */
  addClassSlotOverride: (
    serviceId: string,
    override: Omit<ClassSlotOverride, "id">
  ): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((s) => s.id === serviceId);
    if (!target) { throw new Error("Serviço não encontrado."); }

    const id = `ovr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((s) =>
      s.id === serviceId
        ? { ...s, overrides: [...(s.overrides || []), { ...override, id }], updatedAt: now }
        : s
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((s) => s.id === serviceId) as ServiceCatalogItem;
  },

  /**
   * Remove exceção pontual de um serviço
   */
  removeClassSlotOverride: (serviceId: string, overrideId: string): ServiceCatalogItem => {
    const catalog = readServiceCatalog();
    const target = catalog.find((s) => s.id === serviceId);
    if (!target) { throw new Error("Serviço não encontrado."); }

    const now = new Date().toISOString();
    const updatedCatalog = catalog.map((s) =>
      s.id === serviceId
        ? {
            ...s,
            overrides: (s.overrides || []).filter((o) => o.id !== overrideId),
            updatedAt: now,
          }
        : s
    );

    saveServiceCatalog(updatedCatalog);
    return updatedCatalog.find((s) => s.id === serviceId) as ServiceCatalogItem;
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
