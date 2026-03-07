import React, { useState, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Users,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarCheck,
  Flame,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Target,
  BarChart3,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS, ProfileType } from "../types";
import { mockAthletes, MockAthlete } from "../data/mockData";

type StatusFilter = "todos" | "ativo" | "inativo" | "pendente";
type SortField =
  | "name"
  | "checkInsThisMonth"
  | "totalSessions"
  | "streak"
  | "profile";
type SortDir = "asc" | "desc";

const STATUS_CONFIG = {
  ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
  inativo: { label: "Inativo", color: "bg-red-100 text-red-800" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-800" },
};

const PLAN_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const AdminEnrolled: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [profileFilter, setProfileFilter] = useState<ProfileType | "all">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const athletes = useMemo(() => {
    let filtered = [...mockAthletes];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.teacher.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "todos")
      filtered = filtered.filter((a) => a.status === statusFilter);
    if (profileFilter !== "all")
      filtered = filtered.filter((a) => a.profile === profileFilter);

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "checkInsThisMonth":
          cmp = a.checkInsThisMonth - b.checkInsThisMonth;
          break;
        case "totalSessions":
          cmp = a.totalSessions - b.totalSessions;
          break;
        case "streak":
          cmp = a.streak - b.streak;
          break;
        case "profile":
          cmp = a.profile.localeCompare(b.profile);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return filtered;
  }, [searchTerm, statusFilter, profileFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field)
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const totalAthletes = mockAthletes.length;
  const activeAthletes = mockAthletes.filter(
    (a) => a.status === "ativo",
  ).length;
  const trainingNow = mockAthletes.filter((a) => a.isTrainingNow).length;
  const totalCheckIns = mockAthletes.reduce(
    (s, a) => s + a.checkInsThisMonth,
    0,
  );

  const getCheckInTrend = (current: number, previous: number) => {
    if (current > previous)
      return {
        icon: TrendingUp,
        color: "text-green-600",
        label: `+${current - previous}`,
      };
    if (current < previous)
      return {
        icon: TrendingDown,
        color: "text-red-500",
        label: `${current - previous}`,
      };
    return { icon: Minus, color: "text-gray-400", label: "0" };
  };

  const completionRate = (a: MockAthlete) =>
    a.totalSessions === 0
      ? 0
      : Math.round((a.completedSessions / a.totalSessions) * 100);
  const formatDateTime = (d: Date | null) =>
    d
      ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
        " às " +
        d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "—";
  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "—";

  // Per-service breakdown
  const serviceBreakdown = (
    [
      "huron-areia",
      "huron-personal",
      "huron-recovery",
      "htri",
      "avitta",
    ] as ProfileType[]
  ).map((p) => ({
    profile: p,
    count: mockAthletes.filter((a) => a.profile === p).length,
    active: mockAthletes.filter((a) => a.profile === p && a.status === "ativo")
      .length,
    training: mockAthletes.filter((a) => a.profile === p && a.isTrainingNow)
      .length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Todos os Matriculados</h1>
        <p className="text-gray-600">
          Visão geral de todos os atletas em todos os serviços
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{totalAthletes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ativos</p>
              <p className="text-xl font-bold">{activeAthletes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-50">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Treinando Agora</p>
              <p className="text-xl font-bold">{trainingNow}</p>
            </div>
          </div>
          {trainingNow > 0 && (
            <div className="absolute top-2 right-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <CalendarCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-ins (mês)</p>
              <p className="text-xl font-bold">{totalCheckIns}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Per-service Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {serviceBreakdown.map((s) => (
          <Card
            key={s.profile}
            className="p-3 cursor-pointer transition-all hover:shadow-md border-l-4"
            style={{ borderLeftColor: PROFILE_COLORS[s.profile] }}
            onClick={() =>
              setProfileFilter(profileFilter === s.profile ? "all" : s.profile)
            }
          >
            <p
              className="text-xs font-semibold"
              style={{ color: PROFILE_COLORS[s.profile] }}
            >
              {PROFILE_NAMES[s.profile]}
            </p>
            <p className="text-lg font-bold">{s.count}</p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{s.active} ativos</span>
              {s.training > 0 && (
                <span className="text-green-600">{s.training} treinando</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["todos", "ativo", "inativo", "pendente"] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${statusFilter === status ? "bg-gray-800 text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {status === "todos" ? "Todos" : STATUS_CONFIG[status].label}
                </button>
              ),
            )}
            {profileFilter !== "all" && (
              <button
                onClick={() => setProfileFilter("all")}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Limpar serviço
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Athletes Table */}
      <Card className="overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div
            className="col-span-3 flex items-center gap-1 cursor-pointer"
            onClick={() => toggleSort("name")}
          >
            Atleta <ArrowUpDown className="w-3 h-3" />
          </div>
          <div
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("profile")}
          >
            Serviço <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Plano</div>
          <div
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("checkInsThisMonth")}
          >
            Check-ins <ArrowUpDown className="w-3 h-3" />
          </div>
          <div
            className="col-span-1 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("streak")}
          >
            Streak <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 text-center">Sessões</div>
          <div className="col-span-1 text-center">Ações</div>
        </div>

        {athletes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum atleta encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {athletes.map((athlete) => {
              const isExpanded = expandedId === athlete.id;
              const trend = getCheckInTrend(
                athlete.checkInsThisMonth,
                athlete.checkInsLastMonth,
              );
              const TrendIcon = trend.icon;
              const rate = completionRate(athlete);
              const statusCfg = STATUS_CONFIG[athlete.status];
              const profileColor = PROFILE_COLORS[athlete.profile];

              return (
                <div
                  key={athlete.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-6 py-4 items-center">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                          style={{ backgroundColor: profileColor }}
                        >
                          {athlete.name.charAt(0)}
                        </div>
                        {athlete.isTrainingNow && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {athlete.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {athlete.teacher}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Badge
                        style={{
                          backgroundColor: `${profileColor}15`,
                          color: profileColor,
                        }}
                        className="text-xs"
                      >
                        {PROFILE_NAMES[athlete.profile]}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Badge className={`${statusCfg.color} text-xs`}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-center text-xs text-gray-600">
                      {PLAN_LABELS[athlete.plan]}
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold">
                          {athlete.checkInsThisMonth}
                        </span>
                        <span
                          className={`flex items-center gap-0.5 text-xs ${trend.color}`}
                        >
                          <TrendIcon className="w-3.5 h-3.5" />
                          {trend.label}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <Flame
                        className={`w-4 h-4 ${athlete.streak >= 10 ? "text-orange-500" : athlete.streak >= 4 ? "text-amber-400" : "text-gray-300"}`}
                      />
                      <span className="font-bold text-sm">
                        {athlete.streak}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-bold text-sm">
                        {athlete.completedSessions}
                      </p>
                      <p className="text-xs text-gray-400">{rate}%</p>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : athlete.id)
                        }
                        className="h-8 px-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 bg-gray-50/70 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 text-sm">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> Informações
                          </h4>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {athlete.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {athlete.phone}
                          </div>
                          {athlete.goal && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Target className="w-3.5 h-3.5 text-gray-400" />
                              {athlete.goal}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarCheck className="w-3.5 h-3.5 text-gray-400" />
                            Desde {formatDate(athlete.enrolledSince)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <Activity className="w-4 h-4" /> Sessões
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-white border text-center">
                              <p className="text-lg font-bold text-green-600">
                                {athlete.completedSessions}
                              </p>
                              <p className="text-xs text-gray-500">
                                Realizadas
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-white border text-center">
                              <p className="text-lg font-bold text-amber-600">
                                {athlete.cancelledSessions}
                              </p>
                              <p className="text-xs text-gray-500">
                                Canceladas
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-white border text-center">
                              <p className="text-lg font-bold text-red-500">
                                {athlete.noShowSessions}
                              </p>
                              <p className="text-xs text-gray-500">Faltas</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white border text-center">
                              <p
                                className="text-lg font-bold"
                                style={{ color: profileColor }}
                              >
                                {athlete.totalSessions}
                              </p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4" /> Aproveitamento
                          </h4>
                          <div className="p-3 rounded-lg bg-white border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Taxa
                              </span>
                              <span
                                className="text-lg font-bold"
                                style={{ color: profileColor }}
                              >
                                {rate}%
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${rate}%`,
                                  backgroundColor: profileColor,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Último check-in:{" "}
                              {formatDateTime(athlete.lastCheckIn)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="text-center text-sm text-gray-500">
        Exibindo {athletes.length} de {mockAthletes.length} matriculados
      </div>
    </div>
  );
};
