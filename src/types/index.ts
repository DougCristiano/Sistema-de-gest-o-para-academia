export type UserRole = "admin" | "manager" | "teacher" | "student";

export type ProfileType = "huron-areia" | "huron-personal" | "huron-recovery" | "htri" | "avitta";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profiles: ProfileType[]; // serviços onde trabalha
  studentProfiles?: ProfileType[]; // serviços onde é aluno
  avatar?: string;
  cpf: string;
  phone: string;
  birthDate: string; // ISO string "YYYY-MM-DD"
  gender: "masculino" | "feminino" | "outro" | "prefiro-nao-informar";
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Manager extends User {
  role: "manager";
  managedProfile: ProfileType;
  isAlsoTeacher: boolean;
}

export interface Teacher extends User {
  role: "teacher";
  specialty: string;
}

export interface Student extends User {
  role: "student";
  enrolledProfiles: ProfileType[];
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  profile: ProfileType;
  date: Date;
  time: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
}

export interface NewsComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  content: string;
  date: Date;
  likes: number;
  likedByMe: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  type: "promotion" | "event" | "announcement";
  profiles: ProfileType[];
  date: Date;
  image?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  likes: number;
  likedByMe: boolean;
  comments: NewsComment[];
  shares: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  appointmentsToday: number;
  appointmentsWeek: number;
  revenue?: number;
  attendanceRate?: number;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

export interface ProfileConfig {
  id: string;
  profile: ProfileType;
  schedule: Record<string, DaySchedule>;
  maxStudentsPerSlot: number;
  classDuration: number; // in minutes
  breakBetweenClasses: number; // in minutes
  allowGroupClasses: boolean;
  maxGroupSize: number;
  autoConfirmBookings: boolean;
  cancellationDeadline: number; // hours before class
  allowWaitlist: boolean;
  notes: string;
}

export const PROFILE_NAMES: Record<ProfileType, string> = {
  "huron-areia": "Huron Areia",
  "huron-personal": "Huron Personal",
  "huron-recovery": "Huron Recovery",
  htri: "HTRI",
  avitta: "Avitta",
};

export const PROFILE_COLORS: Record<ProfileType, string> = {
  "huron-areia": "#22c55e", // verde Huron
  "huron-personal": "#3b82f6", // azul Huron
  "huron-recovery": "#eab308", // amarelo Huron
  htri: "#92400e", // marrom Huron
  avitta: "#8b5cf6", // roxo
};

// ============================================================
// SUBSCRIPTIONS (Planos)
// ============================================================

export type PlanType = "mensal" | "trimestral" | "semestral" | "anual";
export type SubscriptionStatus = "ativo" | "expirado" | "pendente" | "cancelado";

export interface Subscription {
  id: string;
  userId: string;
  profile: ProfileType;
  planType: PlanType;
  price: number;          // valor mensal efetivo
  classesPerMonth: number; // total de aulas permitidas no mês
  classesUsed: number;    // aulas realizadas no mês corrente
  startDate: string;      // ISO "YYYY-MM-DD"
  nextBillingDate: string; // ISO "YYYY-MM-DD"
  status: SubscriptionStatus;
}

export const PLAN_LABELS: Record<PlanType, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ativo: "Ativo",
  expirado: "Expirado",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, string> = {
  ativo: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  expirado: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  pendente: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  cancelado: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
};
