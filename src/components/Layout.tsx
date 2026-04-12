import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Newspaper,
  LogOut,
  UserPlus,
  Settings,
  Activity,
  GraduationCap,
  CalendarPlus,
  CalendarClock,
  UserCircle,
  Briefcase,
  ChevronLeft,
} from "lucide-react";
import logo from "../assets/logo.png";
import { PROFILE_NAMES } from "../types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  teacher: "Professor",
  student: "Aluno",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/15 text-red-600 dark:text-red-400",
  manager: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  teacher: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  student: "bg-green-500/15 text-green-600 dark:text-green-400",
};

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  group?: string;
}

export const Layout: React.FC = () => {
  const { currentUser, logout, currentProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenuItems = (): MenuItem[] => {
    if (!currentUser) { return []; }
    const hasStudentProfiles =
      currentUser.studentProfiles && currentUser.studentProfiles.length > 0;

    switch (currentUser.role) {
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin", group: "Principal" },
          { icon: Users, label: "Usuários", path: "/admin/users", group: "Gestão" },
          { icon: Briefcase, label: "Serviços", path: "/admin/services", group: "Gestão" },
          { icon: CalendarClock, label: "Professores e Horários", path: "/admin/service-teachers", group: "Gestão" },
          { icon: GraduationCap, label: "Matriculados", path: "/admin/enrolled", group: "Gestão" },
          { icon: Calendar, label: "Agendamentos", path: "/admin/appointments", group: "Gestão" },
          { icon: Newspaper, label: "Feed de Notícias", path: "/admin/news", group: "Conteúdo" },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking", group: "Aluno" }]
            : []),
        ];
      case "manager":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/manager", group: "Principal" },
          { icon: Activity, label: "Atletas", path: "/manager/athletes", group: "Gestão" },
          { icon: Users, label: "Professores", path: "/manager/teachers", group: "Gestão" },
          { icon: Calendar, label: "Agendamentos", path: "/manager/appointments", group: "Gestão" },
          { icon: UserPlus, label: "Adicionar Professor", path: "/manager/add-teacher", group: "Gestão" },
          { icon: Settings, label: "Configurar Serviço", path: "/manager/config", group: "Configurações" },
          { icon: CalendarClock, label: "Professores e Horários", path: "/manager/service-teachers", group: "Configurações" },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking", group: "Aluno" }]
            : []),
          { icon: UserCircle, label: "Meu Perfil", path: "/profile", group: "Conta" },
        ];
      case "teacher":
        return [
          { icon: Calendar, label: "Minha Agenda", path: "/teacher", group: "Principal" },
          { icon: Users, label: "Meus Alunos", path: "/teacher/students", group: "Principal" },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking", group: "Aluno" }]
            : []),
          { icon: UserCircle, label: "Meu Perfil", path: "/profile", group: "Conta" },
        ];
      case "student":
        return [
          { icon: LayoutDashboard, label: "Meu Painel", path: "/student", group: "Principal" },
          { icon: CalendarPlus, label: "Agendar Aula", path: "/student/booking", group: "Aulas" },
          { icon: Calendar, label: "Minhas Aulas", path: "/student/appointments", group: "Aulas" },
          { icon: Newspaper, label: "Notícias", path: "/student/news", group: "Conteúdo" },
          { icon: UserCircle, label: "Meu Perfil", path: "/profile", group: "Conta" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const group = item.group || "Geral";
    if (!acc[group]) { acc[group] = []; }
    acc[group].push(item);
    return acc;
  }, {});

  const currentItem = menuItems.find((i) => i.path === location.pathname);

  const FALLBACK_LABELS: Record<string, string> = {
    "/profile": "Meu Perfil",
    "/admin": "Dashboard",
    "/admin/users": "Usuários",
    "/admin/services": "Serviços",
    "/admin/service-teachers": "Professores e Horários",
    "/admin/enrolled": "Matriculados",
    "/admin/appointments": "Agendamentos",
    "/admin/news": "Feed de Notícias",
    "/manager": "Dashboard",
    "/manager/athletes": "Atletas",
    "/manager/teachers": "Professores",
    "/manager/appointments": "Agendamentos",
    "/manager/add-teacher": "Adicionar Professor",
    "/manager/config": "Configurar Serviço",
    "/manager/service-teachers": "Professores e Horários",
    "/teacher": "Minha Agenda",
    "/teacher/students": "Meus Alunos",
    "/student": "Meu Painel",
    "/student/booking": "Agendar Aula",
    "/student/appointments": "Minhas Aulas",
    "/student/news": "Notícias",
    "/booking": "Agendar Aula",
  };

  const pageTitle = currentItem?.label ?? FALLBACK_LABELS[location.pathname] ?? "";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[68px]" : "w-64"
        } flex-shrink-0 transition-all duration-300 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden`}
      >
        {/* Logo Area — clicável para toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`flex-shrink-0 w-full group cursor-pointer transition-all duration-200 hover:brightness-110 ${
            collapsed ? "flex flex-col items-center py-4" : "flex items-center gap-3 px-4 py-4"
          }`}
          style={{ background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <h1 className="font-bold text-sm text-white leading-tight truncate">Huron Oficial</h1>
                {currentProfile && (
                  <p className="text-[10px] text-green-200 truncate">{PROFILE_NAMES[currentProfile]}</p>
                )}
              </div>
              <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
            </>
          )}
        </button>

        {/* User Card */}
        <div className={`py-3 border-b border-sidebar-border flex-shrink-0 ${collapsed ? "px-2" : "px-3"}`}>
          <button
            onClick={() => navigate("/profile")}
            title={collapsed ? currentUser?.name : undefined}
            className={`w-full flex items-center rounded-xl hover:bg-sidebar-accent transition-all duration-200 group ${
              collapsed ? "justify-center p-2" : "gap-3 p-2.5"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22c55e] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {currentUser?.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm text-sidebar-foreground truncate leading-tight">
                  {currentUser?.name}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
                    ROLE_COLORS[currentUser?.role || "student"]
                  }`}
                >
                  {ROLE_LABELS[currentUser?.role || "student"]}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-3"}`}>
          {Object.entries(groupedItems).map(([group, items], groupIndex) => (
            <div key={group} className={groupIndex > 0 ? "mt-4" : ""}>
              {!collapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1.5">
                  {group}
                </p>
              )}
              {collapsed && groupIndex > 0 && (
                <div className="my-2 border-t border-sidebar-border mx-1" />
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center rounded-lg transition-all duration-200 relative ${
                          collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                        } ${
                          isActive
                            ? "bg-primary/15 text-primary font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                        {isActive && collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className={`border-t border-sidebar-border flex-shrink-0 ${collapsed ? "p-2" : "p-3"}`}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Sair da conta" : undefined}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 cursor-pointer ${
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair da conta</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-sidebar-border px-5 h-[68px] flex-shrink-0 flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0">
              {pageTitle && (
                <span className="text-sm font-semibold text-foreground truncate">
                  {pageTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </span>
              <div className="w-px h-5 bg-border" />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
