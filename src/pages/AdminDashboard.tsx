import React, { useState } from "react";
import { StatCard } from "../components/StatCard";
import { Calendar, DollarSign, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Card } from "../components/ui/card";
import { Tabs , TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  mockDashboardStats,
  mockAppointments,
  mockPeakHours,
  mockWeeklyAppointments,
  mockMonthlyGrowth,
  mockProfileDistribution,
  mockAttendanceByProfile,
} from "../data/mockData";
import { PROFILE_NAMES, PROFILE_COLORS, ProfileType } from "../types";
import { AppointmentCard } from "../components/AppointmentCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | "all">("all");
  const stats = mockDashboardStats[selectedProfile];

  const profiles: (ProfileType | "all")[] = [
    "all",
    "huron-areia",
    "huron-personal",
    "huron-recovery",
    "htri",
    "avitta",
  ];

  const todayAppointments = mockAppointments.filter((apt) => {
    const today = new Date();
    return apt.date.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral de todos os serviços da Huron</p>
      </div>

      {/* Profile Filters */}
      <div className="flex flex-wrap gap-2">
        {profiles.map((profile) => {
          const isActive = selectedProfile === profile;
          const color = profile === "all" ? "#6b7280" : PROFILE_COLORS[profile as ProfileType];

          return (
            <button
              key={profile}
              onClick={() => setSelectedProfile(profile)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg scale-105"
                  : "bg-card border border-border text-foreground hover:shadow-md hover:border-primary/30"
              }`}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              {profile === "all" ? "Todos" : PROFILE_NAMES[profile as ProfileType]}
            </button>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Alunos"
          value={stats.totalStudents}
          icon={Users}
          color="#3b82f6"
        />
        <StatCard
          title="Professores"
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="#92400e"
        />
        <StatCard
          title="Agendamentos Hoje"
          value={stats.appointmentsToday}
          icon={Calendar}
          color="#22c55e"
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${stats.revenue?.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          color="#eab308"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          title="Agendamentos esta Semana"
          value={stats.appointmentsWeek}
          icon={Calendar}
          color="#3b82f6"
          subtitle="Mantendo a consistência"
        />
        <StatCard
          title="Taxa de Presença"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="#22c55e"
          subtitle="Excelente engajamento"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peak Hours Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Horários de Pico</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockPeakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar
                dataKey="appointments"
                fill="#22c55e"
                radius={[8, 8, 0, 0]}
                name="Agendamentos"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Appointments */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Agendamentos por Dia da Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockWeeklyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar
                dataKey="appointments"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Agendamentos"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Growth */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Evolução de Alunos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockMonthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#22c55e"
                strokeWidth={3}
                name="Alunos"
                dot={{ fill: "#22c55e", r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#eab308"
                strokeWidth={3}
                name="Receita (R$)"
                dot={{ fill: "#eab308", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Profile Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Distribuição por Serviço</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockProfileDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {mockProfileDistribution.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Attendance Rate by Profile */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Taxa de Presença por Serviço</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAttendanceByProfile} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="profile" type="category" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="rate" radius={[0, 8, 8, 0]} name="Taxa de Presença (%)">
                {mockAttendanceByProfile.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Appointments Today */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Agendamentos de Hoje</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum agendamento para hoje</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showStudent={true}
                showTeacher={true}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Profile Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Visão por Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            ["huron-areia", "huron-personal", "huron-recovery", "htri", "avitta"] as ProfileType[]
          ).map((profile) => {
            const profileStats = mockDashboardStats[profile];
            return (
              <Card
                key={profile}
                className="p-4 border-2"
                style={{ borderColor: PROFILE_COLORS[profile] }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROFILE_COLORS[profile] }}
                  />
                  <h3 className="font-semibold">{PROFILE_NAMES[profile]}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alunos:</span>
                    <span className="font-medium">{profileStats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professores:</span>
                    <span className="font-medium">{profileStats.totalTeachers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Presença:</span>
                    <span className="font-medium">{profileStats.attendanceRate}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
