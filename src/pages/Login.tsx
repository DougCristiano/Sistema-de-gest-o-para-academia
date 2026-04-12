import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ThemeToggle } from "../components/ThemeToggle";
import logo from "../assets/logo.png";
import academia from "../assets/academia.png";
import { Activity, Users, TrendingUp, Shield, ChevronRight, Eye, EyeOff } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirecionar após login bem-sucedido
  React.useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "manager":
          navigate("/manager", { replace: true });
          break;
        case "teacher":
          navigate("/teacher", { replace: true });
          break;
        case "student":
          navigate("/student", { replace: true });
          break;
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Email ou senha inválidos");
      }
      // Redirecionamento acontece via useEffect acima
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background photo */}
        <img
          src={academia}
          alt="Huron Academia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark green overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(22,101,52,0.82) 0%, rgba(21,128,61,0.70) 40%, rgba(22,163,74,0.55) 100%)",
          }}
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
            <h1 className="text-2xl font-bold text-foreground dark:text-white">Huron Oficial</h1>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-foreground dark:text-white">Bem-vindo de volta</h2>
            <p className="mt-1 text-muted-foreground dark:text-green-200/70 text-sm">Entre com suas credenciais para acessar o sistema</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="dark:text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="!bg-white dark:!bg-[#1a5c3a] !border-2 !border-slate-300 dark:!border-[#22c55e]/40 !text-foreground dark:!text-white placeholder:!text-slate-400 dark:placeholder:!text-white/70 focus-visible:!border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="dark:text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="!bg-white dark:!bg-[#1a5c3a] !border-2 !border-slate-300 dark:!border-[#22c55e]/40 !text-foreground dark:!text-white placeholder:!text-slate-400 dark:placeholder:!text-white/70 focus-visible:!border-primary pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-green-300 dark:hover:text-green-100 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
          <div className="pt-4 border-t border-border dark:border-[#22c55e]/20">
            <p className="text-xs text-muted-foreground dark:text-green-200/70 mb-3 text-center font-medium uppercase tracking-wide">
              Acesso rápido para demonstração
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("carlos@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border dark:border-[#22c55e]/40 hover:border-primary/40 dark:hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-[#1a5c3a]/50 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground dark:text-white">Admin</span>
                <span className="text-[11px] text-muted-foreground dark:text-green-200/60 truncate w-full">carlos@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("ana@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border dark:border-[#22c55e]/40 hover:border-primary/40 dark:hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-[#1a5c3a]/50 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground dark:text-white">Gerente</span>
                <span className="text-[11px] text-muted-foreground dark:text-green-200/60 truncate w-full">ana@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("pedro@academia.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border dark:border-[#22c55e]/40 hover:border-primary/40 dark:hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-[#1a5c3a]/50 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground dark:text-white">Professor</span>
                <span className="text-[11px] text-muted-foreground dark:text-green-200/60 truncate w-full">pedro@academia.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("joao@email.com")}
                className="flex flex-col items-start p-3 rounded-lg border border-border dark:border-[#22c55e]/40 hover:border-primary/40 dark:hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-[#1a5c3a]/50 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground dark:text-white">Aluno</span>
                <span className="text-[11px] text-muted-foreground dark:text-green-200/60 truncate w-full">joao@email.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
