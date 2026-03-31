import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Newspaper,
  LogOut,
  Menu,
  X,
  UserPlus,
  Settings,
  Activity,
  GraduationCap,
  CalendarPlus,
  UserCircle,
  Briefcase,
} from "lucide-react";
import logo from "../assets/logo.png";
import { PROFILE_NAMES } from "../types";

export const Layout: React.FC = () => {
  const { currentUser, logout, currentProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenuItems = () => {
    if (!currentUser) {return [];}
    const hasStudentProfiles =
      currentUser.studentProfiles && currentUser.studentProfiles.length > 0;

    switch (currentUser.role) {
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
          { icon: Users, label: "Gerenciar Usuários", path: "/admin/users" },
          { icon: Briefcase, label: "Gerenciar Servicos", path: "/admin/services" },
          {
            icon: GraduationCap,
            label: "Matriculados",
            path: "/admin/enrolled",
          },
          {
            icon: Calendar,
            label: "Agendamentos",
            path: "/admin/appointments",
          },
          { icon: Newspaper, label: "Feed de Notícias", path: "/admin/news" },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking" }]
            : []),
          { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        ];
      case "manager":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/manager" },
          { icon: Activity, label: "Atletas", path: "/manager/athletes" },
          { icon: Users, label: "Professores", path: "/manager/teachers" },
          {
            icon: Calendar,
            label: "Agendamentos",
            path: "/manager/appointments",
          },
          {
            icon: UserPlus,
            label: "Adicionar Professor",
            path: "/manager/add-teacher",
          },
          {
            icon: Settings,
            label: "Configurar Serviço",
            path: "/manager/config",
          },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking" }]
            : []),
          { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        ];
      case "teacher":
        return [
          { icon: Calendar, label: "Minha Agenda", path: "/teacher" },
          { icon: Users, label: "Meus Alunos", path: "/teacher/students" },
          ...(hasStudentProfiles
            ? [{ icon: CalendarPlus, label: "Agendar Aula", path: "/booking" }]
            : []),
          { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        ];
      case "student":
        return [
          { icon: LayoutDashboard, label: "Meu Painel", path: "/student" },
          {
            icon: CalendarPlus,
            label: "Agendar Aula",
            path: "/student/booking",
          },
          {
            icon: Calendar,
            label: "Minhas Aulas",
            path: "/student/appointments",
          },
          { icon: Newspaper, label: "Notícias", path: "/student/news" },
          { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-bold text-lg">Huron Gestão</h1>
              {currentProfile && (
                <p className="text-xs text-gray-500">{PROFILE_NAMES[currentProfile]}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors p-1 -m-1"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] to-[#3b82f6] rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#22c55e]/10 text-[#22c55e] font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
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
