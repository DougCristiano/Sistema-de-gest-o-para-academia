import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import logo from "../assets/logo.png";
import { Activity, Users, TrendingUp, Shield, ChevronRight } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(email, password);
    if (success) {
      if (email.includes("admin")) {
        navigate("/admin");
      } else if (email.includes("manager")) {
        navigate("/manager");
      } else if (email.includes("teacher")) {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } else {
      setError("Email ou senha inválidos");
    }
  };

  const quickLogin = (emailValue: string) => {
    setEmail(emailValue);
    setPassword("senha123");
  };

  const features = [
    { icon: Users, text: "Gestão completa de alunos e professores" },
    { icon: Activity, text: "Acompanhamento de treinos e check-ins" },
    { icon: TrendingUp, text: "Relatórios e métricas em tempo real" },
    { icon: Shield, text: "Controle de acesso por perfil" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #166534 0%, #15803d 30%, #16a34a 60%, #22c55e 100%)",
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />

        {/* Logo + Name */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <img src={logo} alt="Huron Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Huron Oficial</h1>
            <p className="text-green-200 text-sm">Sistema de Gestão</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Gerencie sua academia com
              <span className="block text-yellow-300 mt-1">eficiência total</span>
            </h2>
            <p className="mt-4 text-green-100 text-base leading-relaxed max-w-sm">
              Plataforma integrada para administração, controle de alunos, agendamentos e muito mais — tudo em um só lugar.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-green-100">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-green-300 text-xs">© 2025 Huron Oficial · Todos os direitos reservados</p>
        </div>
      </div>

      {/* Right Panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo (visible only on small screens) */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <img src={logo} alt="Huron Logo" className="h-16 object-contain" />
            <h1 className="text-2xl font-bold text-foreground">Huron Oficial</h1>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="mt-1 text-muted-foreground text-sm">Entre com suas credenciais para acessar o sistema</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Entrar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick login */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 text-center font-medium uppercase tracking-wide">
              Acesso rápido para demonstração
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("carlos@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">Admin</span>
                <span className="text-[11px] text-muted-foreground truncate w-full">carlos@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("ana@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">Gerente</span>
                <span className="text-[11px] text-muted-foreground truncate w-full">ana@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("pedro@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">Professor</span>
                <span className="text-[11px] text-muted-foreground truncate w-full">pedro@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("joao@email.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">Aluno</span>
                <span className="text-[11px] text-muted-foreground truncate w-full">joao@email.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
