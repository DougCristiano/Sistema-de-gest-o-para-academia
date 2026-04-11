import React from "react";
import { useAuth } from "../context/AuthContext";
import { StatCard } from "../components/StatCard";
import { Card } from "../components/ui/card";
import { AppointmentCard } from "../components/AppointmentCard";
import { Users , TrendingUp, DollarSign } from "lucide-react";
import {
  mockDashboardStats,
  mockAppointments,
  mockUsers,
  mockPeakHours,
  mockWeeklyAppointments,
  mockRevenueGrowth,
} from "../data/mockData";
import { PROFILE_NAMES, PROFILE_COLORS } from "../types";
import { Badge } from "../components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export const ManagerDashboard: React.FC = () => {
  const { currentProfile } = useAuth();

  if (!currentProfile) {
    return <div>Selecione um serviço</div>;
  }

  const stats = mockDashboardStats[currentProfile];
  const profileColor = PROFILE_COLORS[currentProfile];

  // Filtrar agendamentos do serviço
  const profileAppointments = mockAppointments
    .filter((apt) => apt.profile === currentProfile)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filtrar professores do serviço
  const profileTeachers = mockUsers.filter(
    (user) => user.role === "teacher" && user.profiles.includes(currentProfile)
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: profileColor }} />
          <h1 className="text-3xl font-bold">{PROFILE_NAMES[currentProfile]}</h1>
        </div>
        <p className="text-muted-foreground">Dashboard de Gerenciamento</p>
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
          icon={Users}
          color="#92400e"
        />
        <StatCard
          title="Agendamentos Hoje"
          value={stats.appointmentsToday}
          icon={Calendar}
          color="#22c55e"
        />
        <StatCard
          title="Taxa de Presença"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="#eab308"
        />
      </div>

      {/* Revenue Card */}
      <Card
        className="p-6 bg-gradient-to-br hover:shadow-xl transition-all duration-300 hover:scale-102"
        style={{
          borderLeft: `4px solid ${profileColor}`,
          backgroundImage: `linear-gradient(135deg, ${profileColor}08 0%, transparent 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">Receita Mensal</p>
            <p className="text-4xl font-bold text-foreground">R$ {stats.revenue?.toLocaleString("pt-BR")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.appointmentsWeek} agendamentos esta semana
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: `${profileColor}15` }}>
            <DollarSign className="w-8 h-8" style={{ color: profileColor }} />
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peak Hours for Profile */}
        <Card className="p-6 border-l-4" style={{ borderLeftColor: profileColor }}>
          <h2 className="text-xl font-bold mb-4 text-foreground">Horários de Pico do Serviço</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockPeakHours}>
              <defs>
                <linearGradient id={`colorProfile-${currentProfile}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={profileColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={profileColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="appointments"
                stroke={profileColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorProfile-${currentProfile})`}
                name="Agendamentos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Appointments for Profile */}
        <Card className="p-6 border-l-4" style={{ borderLeftColor: profileColor }}>
          <h2 className="text-xl font-bold mb-4 text-foreground">Agendamentos Semanais</h2>
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
                fill={profileColor}
                radius={[8, 8, 0, 0]}
                name="Agendamentos"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Growth */}
        <Card className="p-6 lg:col-span-2 border-l-4" style={{ borderLeftColor: profileColor }}>
          <h2 className="text-xl font-bold mb-4 text-foreground">Evolução da Receita (Últimos 6 Meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueGrowth}>
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
                formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#eab308"
                strokeWidth={3}
                name="Receita"
                dot={{ fill: "#eab308", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Teachers List */}
      <Card className="p-6 border-l-4" style={{ borderLeftColor: profileColor }}>
        <h2 className="text-xl font-bold mb-4 text-foreground">Professores do Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:shadow-md hover:scale-102 transition-all duration-300 bg-card"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {teacher.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{teacher.name}</p>
                <p className="text-sm text-muted-foreground">{teacher.email}</p>
              </div>
              <Badge variant="secondary">Professor</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="p-6 border-l-4" style={{ borderLeftColor: profileColor }}>
        <h2 className="text-xl font-bold mb-4 text-foreground">Próximos Agendamentos</h2>
        {profileAppointments.length === 0 ? (
          <p className="text-gray-500 text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileAppointments.slice(0, 6).map((appointment) => (
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
    </div>
  );
};
