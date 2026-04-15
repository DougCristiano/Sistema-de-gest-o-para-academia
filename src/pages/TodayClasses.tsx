import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import {
  CheckCircle2,
  Clock,
  User,
  XCircle,
  CalendarCheck,
  Filter,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckIn,
  CheckInStatus,
  CHECK_IN_TYPE_LABELS,
  CHECK_IN_TYPE_COLORS,
  PROFILE_NAMES,
  PROFILE_COLORS,
  ProfileType,
} from "../types";
import { useCheckIns } from "../context/CheckInsContext";

const TODAY = "2026-04-12";

const formattedToday = format(parseISO(TODAY), "EEEE, dd 'de' MMMM 'de' yyyy", {
  locale: ptBR,
});

// ─── Attendance card ──────────────────────────────────────────────────────────

interface AttendanceCardProps {
  checkIn: CheckIn;
  effectiveStatus: CheckInStatus;
  onMark: (id: string, status: "concluido" | "faltou") => void;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  checkIn,
  effectiveStatus,
  onMark,
}) => {
  const serviceColor = PROFILE_COLORS[checkIn.serviceId];
  const initials = checkIn.studentName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-stretch gap-0 rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Time column */}
      <div
        className="flex flex-col items-center justify-center px-4 py-3 min-w-[72px] text-white flex-shrink-0"
        style={{ backgroundColor: serviceColor }}
      >
        <Clock className="w-3.5 h-3.5 opacity-70 mb-0.5" />
        <span className="text-lg font-bold leading-tight">{checkIn.time}</span>
        <span className="text-[10px] opacity-80">{checkIn.duration}min</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: serviceColor + "cc" }}
            >
              {initials}
            </div>

            <div className="min-w-0">
              {/* Student + activity */}
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-semibold text-sm text-foreground">
                  {checkIn.studentName}
                </span>
                {checkIn.activityName && (
                  <span
                    className="text-xs px-1.5 py-0 rounded-full border font-medium"
                    style={{ borderColor: serviceColor, color: serviceColor }}
                  >
                    {checkIn.activityName}
                  </span>
                )}
              </div>
              {/* Teacher + service */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Prof. {checkIn.teacherName}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span>{PROFILE_NAMES[checkIn.serviceId]}</span>
              </div>
            </div>
          </div>

          {/* Right: type + status/actions */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CHECK_IN_TYPE_COLORS[checkIn.type]}`}
            >
              {CHECK_IN_TYPE_LABELS[checkIn.type]}
            </span>

            {effectiveStatus === "agendado" ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onMark(checkIn.id, "concluido")}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Presente
                </button>
                <button
                  onClick={() => onMark(checkIn.id, "faltou")}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Faltou
                </button>
              </div>
            ) : effectiveStatus === "concluido" ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Presente
              </span>
            ) : effectiveStatus === "faltou" ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
                <XCircle className="w-3.5 h-3.5" />
                Faltou
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                Cancelado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const TodayClasses: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, "concluido" | "faltou">
  >({});
  const [serviceFilter, setServiceFilter] = useState<ProfileType | "todos">(
    "todos"
  );

  const { getTodayCheckIns } = useCheckIns();
  const allToday = useMemo(() => getTodayCheckIns(TODAY), [getTodayCheckIns]);

  // Filter by role
  const roleFiltered = useMemo(() => {
    if (!currentUser) { return []; }
    switch (activeRole) {
      case "teacher":
        return allToday.filter((ci) => ci.teacherId === currentUser.id);
      case "manager":
        return allToday.filter((ci) =>
          currentUser.profiles.includes(ci.serviceId as ProfileType)
        );
      case "admin":
      default:
        return allToday;
    }
  }, [allToday, activeRole, currentUser]);

  // Services present in today's data (for filter pills)
  const presentServices = useMemo(() => {
    const ids = [...new Set(roleFiltered.map((ci) => ci.serviceId))];
    return ids as ProfileType[];
  }, [roleFiltered]);

  // Apply service filter
  const visible = useMemo(() => {
    const sorted = [...roleFiltered].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    if (serviceFilter === "todos") { return sorted; }
    return sorted.filter((ci) => ci.serviceId === serviceFilter);
  }, [roleFiltered, serviceFilter]);

  const getEffectiveStatus = (ci: CheckIn): CheckInStatus =>
    statusOverrides[ci.id] ?? ci.status;

  const handleMark = (id: string, status: "concluido" | "faltou") => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  };

  // Stats (based on all role-filtered, using overrides)
  const stats = useMemo(() => {
    const total = roleFiltered.length;
    let concluidas = 0;
    let faltas = 0;
    let pendentes = 0;
    for (const ci of roleFiltered) {
      const s = getEffectiveStatus(ci);
      if (s === "concluido") { concluidas++; }
      else if (s === "faltou") { faltas++; }
      else if (s === "agendado") { pendentes++; }
    }
    return { total, concluidas, faltas, pendentes };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFiltered, statusOverrides]);

  const showServiceFilter =
    (activeRole === "admin" || activeRole === "manager") &&
    presentServices.length > 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Aulas de Hoje</h1>
        <p className="text-muted-foreground capitalize">{formattedToday}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-t-4 border-t-blue-500">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Agendadas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Realizadas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-red-500">
          <p className="text-2xl font-bold text-red-600">{stats.faltas}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Faltas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-amber-400">
          <p className="text-2xl font-bold text-amber-500">{stats.pendentes}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Pendentes</p>
        </Card>
      </div>

      {/* Service filter pills (admin / manager) */}
      {showServiceFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setServiceFilter("todos")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              serviceFilter === "todos"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
            }`}
          >
            Todos
          </button>
          {presentServices.map((sid) => (
            <button
              key={sid}
              onClick={() => setServiceFilter(sid)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                serviceFilter === sid
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
              }`}
            >
              {PROFILE_NAMES[sid]}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarCheck className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma aula hoje</h3>
            <p className="text-sm text-muted-foreground">
              Não há aulas agendadas para hoje.
            </p>
          </Card>
        ) : (
          visible.map((ci) => (
            <AttendanceCard
              key={ci.id}
              checkIn={ci}
              effectiveStatus={getEffectiveStatus(ci)}
              onMark={handleMark}
            />
          ))
        )}
      </div>
    </div>
  );
};
