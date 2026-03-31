import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Edit, Search, Trash2, UserPlus } from "lucide-react";
import { mockUsers } from "../data/mockData";
import { profilesService } from "../services/profiles.service";

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serviceOptions, setServiceOptions] = useState(() => profilesService.getServicesAsOptions());
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "teacher" as "manager" | "teacher",
    profiles: [] as string[],
  });

  useEffect(() => {
    setServiceOptions(profilesService.getServicesAsOptions());
  }, [isDialogOpen]);

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.role !== "student" &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateUser = () => {
    console.log("Creating user:", newUser);
    setIsDialogOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "teacher",
      profiles: [],
    });
  };

  const toggleProfile = (profileId: string) => {
    setNewUser((prev) => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter((p) => p !== profileId)
        : [...prev.profiles, profileId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerentes e professores da Huron</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="joao@academia.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "manager" | "teacher") =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="teacher">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Serviços</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => toggleProfile(service.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newUser.profiles.includes(service.value)
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
                {serviceOptions.length === 0 && (
                  <p className="text-xs text-amber-700 mt-2">Nenhum serviço ativo disponível.</p>
                )}
              </div>
              <Button onClick={handleCreateUser} className="w-full">
                Criar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role === "manager" ? "Gerente" : "Professor"}
                    </Badge>
                    {user.profiles.map((profile) => (
                      <Badge key={profile} variant="secondary">
                        {profilesService.getServiceName(profile)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
