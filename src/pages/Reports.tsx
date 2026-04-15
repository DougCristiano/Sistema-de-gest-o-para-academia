import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Star } from "lucide-react";
import {
  mockCheckIns,
  mockFeedbacks,
  getStudentCheckIns,
  getTeacherFeedbacks,
} from "../data/mockData";
import { Feedback, PROFILE_NAMES, PROFILE_COLORS, ProfileType } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Shared sub-components ────────────────────────────────────────────────────

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value, color = "#22c55e" }) => (
  <Card className="p-4 border-t-4" style={{ borderTopColor: color }}>
    <p className="text-2xl font-bold" style={{ color }}>
      {value}
    </p>
    <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
  </Card>
);

const StarDisplay: React.FC<{ rating: number; size?: "sm" | "md" }> = ({
  rating,
  size = "sm",
}) => {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const FeedbackList: React.FC<{ feedbacks: Feedback[] }> = ({ feedbacks }) => {
  if (feedbacks.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground text-center">
        Nenhuma avaliação ainda.
      </p>
    );
  }
  return (
    <div className="divide-y divide-border">
      {feedbacks.slice(0, 6).map((fb) => {
        const ci = mockCheckIns.find((c) => c.id === fb.checkInId);
        return (
          <div key={fb.id} className="px-4 py-3 flex items-start gap-3">
            <StarDisplay rating={fb.rating} />
            <div className="flex-1 min-w-0">
              {fb.comment && (
                <p className="text-xs text-muted-foreground italic">"{fb.comment}"</p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {PROFILE_NAMES[fb.serviceId]}
                {ci ? ` · ${ci.teacherName}` : ""}
                {" · "}
                {fb.date}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Admin / Manager report ───────────────────────────────────────────────────

const AdminManagerReport: React.FC<{ filteredServices?: ProfileType[] }> = ({
  filteredServices,
}) => {
  const { done, attendanceRate, avgRating, feedbackCount, teachers, serviceChart, recentFeedbacks } =
    useMemo(() => {
      const allServices =
        filteredServices ??
        (["huron-areia", "huron-personal", "huron-recovery", "htri", "avitta"] as ProfileType[]);

      const relevant = mockCheckIns.filter((ci) => allServices.includes(ci.serviceId));
      const past = relevant.filter((ci) => ci.status !== "agendado");
      const done = past.filter((ci) => ci.status === "concluido").length;
      const total = past.length;
      const attendanceRate = total > 0 ? Math.round((done / total) * 100) : 0;

      const relevantFeedbacks = mockFeedbacks.filter((fb) =>
        allServices.includes(fb.serviceId)
      );
      const feedbackCount = relevantFeedbacks.length;
      const avgRating =
        feedbackCount > 0
          ? relevantFeedbacks.reduce((s, f) => s + f.rating, 0) / feedbackCount
          : null;

      // Teacher performance
      const teacherMap = new Map<
        string,
        { name: string; done: number; total: number; ratings: number[] }
      >();
      relevant.forEach((ci) => {
        if (!teacherMap.has(ci.teacherId)) {
          teacherMap.set(ci.teacherId, { name: ci.teacherName, done: 0, total: 0, ratings: [] });
        }
        const t = teacherMap.get(ci.teacherId)!;
        if (ci.status !== "agendado") { t.total++; }
        if (ci.status === "concluido") { t.done++; }
      });
      relevantFeedbacks.forEach((fb) => {
        teacherMap.get(fb.teacherId)?.ratings.push(fb.rating);
      });
      const teachers = [...teacherMap.entries()]
        .map(([id, d]) => ({
          id,
          name: d.name,
          done: d.done,
          attendanceRate: d.total > 0 ? Math.round((d.done / d.total) * 100) : 0,
          avgRating:
            d.ratings.length > 0
              ? d.ratings.reduce((s, r) => s + r, 0) / d.ratings.length
              : null,
        }))
        .sort((a, b) => b.done - a.done);

      // Service chart
      const serviceChart = allServices.map((svc) => {
        const n = relevant.filter((ci) => ci.serviceId === svc && ci.status === "concluido").length;
        const short = PROFILE_NAMES[svc].split(" ").slice(1).join(" ") || PROFILE_NAMES[svc];
        return { name: short, aulas: n, fill: PROFILE_COLORS[svc] };
      });

      return {
        done,
        attendanceRate,
        avgRating,
        feedbackCount,
        teachers,
        serviceChart,
        recentFeedbacks: relevantFeedbacks,
      };
    }, [filteredServices]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Aulas Realizadas" value={done} color="#22c55e" />
        <MiniStat label="Taxa de Presença" value={`${attendanceRate}%`} color="#3b82f6" />
        <MiniStat label="Avaliações Coletadas" value={feedbackCount} color="#8b5cf6" />
        <MiniStat
          label="Nota Média"
          value={avgRating ? avgRating.toFixed(1) + " ⭐" : "—"}
          color="#eab308"
        />
      </div>

      {/* Chart */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-4">Aulas Realizadas por Serviço</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={serviceChart} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v} aulas`, "Realizadas"]} />
            <Bar dataKey="aulas" radius={[6, 6, 0, 0]}>
              {serviceChart.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Teacher table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Desempenho dos Professores</h3>
        </div>
        <div className="divide-y divide-border">
          {teachers.map((t, idx) => (
            <div key={t.id} className="flex items-center gap-4 px-4 py-3">
              <span className="text-xs font-bold text-muted-foreground w-5 flex-shrink-0 text-center">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.done} aulas · {t.attendanceRate}% presença
                </p>
              </div>
              <div className="flex-shrink-0">
                {t.avgRating !== null ? (
                  <StarDisplay rating={t.avgRating} />
                ) : (
                  <span className="text-xs text-muted-foreground">Sem avaliações</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent feedbacks */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Avaliações Recentes</h3>
        </div>
        <FeedbackList feedbacks={recentFeedbacks} />
      </Card>
    </div>
  );
};

// ─── Teacher report ───────────────────────────────────────────────────────────

const TeacherReport: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { done, attendanceRate, studentCount, feedbacks, avgRating, monthlyData } =
    useMemo(() => {
      const myCIs = mockCheckIns.filter((ci) => ci.teacherId === teacherId);
      const past = myCIs.filter((ci) => ci.status !== "agendado");
      const done = past.filter((ci) => ci.status === "concluido").length;
      const attendanceRate =
        past.length > 0 ? Math.round((done / past.length) * 100) : 0;
      const studentSet = new Set(myCIs.map((ci) => ci.studentId));
      const feedbacks = getTeacherFeedbacks(teacherId);
      const avgRating =
        feedbacks.length > 0
          ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
          : null;

      // Monthly breakdown
      const monthMap = new Map<string, number>();
      myCIs
        .filter((ci) => ci.status === "concluido")
        .forEach((ci) => {
          const m = ci.date.slice(0, 7);
          monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
        });
      const monthlyData = [...monthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([m, aulas]) => ({ month: m.slice(5), aulas }));

      return {
        done,
        attendanceRate,
        studentCount: studentSet.size,
        feedbacks,
        avgRating,
        monthlyData,
      };
    }, [teacherId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Aulas Ministradas" value={done} color="#22c55e" />
        <MiniStat label="Alunos Atendidos" value={studentCount} color="#3b82f6" />
        <MiniStat label="Taxa de Presença" value={`${attendanceRate}%`} color="#eab308" />
        <MiniStat
          label="Nota Média"
          value={avgRating ? avgRating.toFixed(1) + " ⭐" : "—"}
          color="#8b5cf6"
        />
      </div>

      {monthlyData.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">Aulas por Mês</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} aulas`, "Ministradas"]} />
              <Bar dataKey="aulas" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Avaliações Recebidas</h3>
        </div>
        <FeedbackList feedbacks={feedbacks} />
      </Card>
    </div>
  );
};

// ─── Student report ───────────────────────────────────────────────────────────

const StudentReport: React.FC<{ studentId: string; profiles: ProfileType[] }> = ({
  studentId,
  profiles,
}) => {
  const { done, attendanceRate, feedbackCount, avgRating, byService } = useMemo(() => {
    const allCIs = getStudentCheckIns(studentId);
    const past = allCIs.filter((ci) => ci.status !== "agendado");
    const done = past.filter((ci) => ci.status === "concluido").length;
    const attendanceRate =
      past.length > 0 ? Math.round((done / past.length) * 100) : 0;

    const myFeedbacks = mockFeedbacks.filter((fb) => fb.authorId === studentId);
    const feedbackCount = myFeedbacks.length;
    const avgRating =
      feedbackCount > 0
        ? myFeedbacks.reduce((s, f) => s + f.rating, 0) / feedbackCount
        : null;

    const byService = profiles.map((svc) => {
      const svCIs = allCIs.filter((ci) => ci.serviceId === svc);
      const d = svCIs.filter((ci) => ci.status === "concluido").length;
      const t = svCIs.filter((ci) => ci.status !== "agendado").length;
      return {
        svc,
        name: PROFILE_NAMES[svc],
        done: d,
        total: t,
        rate: t > 0 ? Math.round((d / t) * 100) : 0,
        color: PROFILE_COLORS[svc],
      };
    });

    return { done, attendanceRate, feedbackCount, avgRating, byService };
  }, [studentId, profiles]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Aulas Realizadas" value={done} color="#22c55e" />
        <MiniStat label="Taxa de Presença" value={`${attendanceRate}%`} color="#3b82f6" />
        <MiniStat label="Aulas Avaliadas" value={feedbackCount} color="#8b5cf6" />
        <MiniStat
          label="Nota Média Dada"
          value={avgRating ? avgRating.toFixed(1) + " ⭐" : "—"}
          color="#eab308"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Presença por Serviço</h3>
        </div>
        <div className="divide-y divide-border">
          {byService.map((s) => (
            <div key={s.svc} className="flex items-center gap-4 px-4 py-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.done} de {s.total} aulas concluídas
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.rate}%`, backgroundColor: s.color }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {s.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const Reports: React.FC = () => {
  const { currentUser, activeRole } = useAuth();

  const titles: Record<string, string> = {
    admin: "Relatórios",
    manager: "Relatórios",
    teacher: "Meu Desempenho",
    student: "Meu Progresso",
  };

  const subtitles: Record<string, string> = {
    admin: "Visão consolidada de todos os serviços",
    manager: "Desempenho dos serviços que você gerencia",
    teacher: "Suas métricas como professor",
    student: "Seu histórico e evolução",
  };

  // For student mode: use profiles (students) or studentProfiles (staff in student mode)
  const studentProfiles: ProfileType[] =
    currentUser?.role === "student"
      ? (currentUser?.profiles as ProfileType[]) ?? []
      : (currentUser?.studentProfiles as ProfileType[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">{titles[activeRole] ?? "Relatórios"}</h1>
        <p className="text-muted-foreground">{subtitles[activeRole] ?? ""}</p>
      </div>

      {activeRole === "admin" && <AdminManagerReport />}

      {activeRole === "manager" && currentUser && (
        <AdminManagerReport filteredServices={currentUser.profiles as ProfileType[]} />
      )}

      {activeRole === "teacher" && currentUser && (
        <TeacherReport teacherId={currentUser.id} />
      )}

      {activeRole === "student" && currentUser && (
        <StudentReport studentId={currentUser.id} profiles={studentProfiles} />
      )}
    </div>
  );
};
