import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import logo from "../assets/logo.png";

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
      // Redirecionar baseado no tipo de usuário
      const user = { email }; // Mock - você teria acesso ao usuário real aqui
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

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword("senha123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22c55e]/10 via-[#3b82f6]/10 to-[#eab308]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo do Sistema" className="h-24 object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Huron Oficial</h1>
          <p className="text-gray-600">Gestão Integrada</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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

          <div>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">Login rápido para demonstração:</p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={() => quickLogin("carlos@academia.com")}
            >
              Admin: carlos@academia.com
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={() => quickLogin("ana@academia.com")}
            >
              Gerente: ana@academia.com
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={() => quickLogin("pedro@academia.com")}
            >
              Professor: pedro@academia.com
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={() => quickLogin("joao@email.com")}
            >
              Aluno: joao@email.com
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
