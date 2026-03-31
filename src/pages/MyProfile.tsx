import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Save,
  X,
  Pencil,
  AlertTriangle,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS , User } from "../types";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  teacher: "Professor",
  student: "Aluno",
};

const GENDER_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  "prefiro-nao-informar": "Prefiro não informar",
};

const BR_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export const MyProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        birthDate: currentUser.birthDate,
        gender: currentUser.gender,
        address: { ...currentUser.address },
        emergencyContact: currentUser.emergencyContact
          ? { ...currentUser.emergencyContact }
          : { name: "", phone: "", relationship: "" },
      });
    }
  }, [currentUser]);

  if (!currentUser) {return null;}

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address!, [field]: value },
    }));
  };

  const handleEmergencyChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact!, [field]: value },
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success("Dados atualizados com sucesso!");
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      birthDate: currentUser.birthDate,
      gender: currentUser.gender,
      address: { ...currentUser.address },
      emergencyContact: currentUser.emergencyContact
        ? { ...currentUser.emergencyContact }
        : { name: "", phone: "", relationship: "" },
    });
    setIsEditing(false);
  };

  const formatCPF = (cpf: string) => cpf;
  const formatDate = (dateStr: string) => {
    if (!dateStr) {return "";}
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const allProfiles = [...currentUser.profiles, ...(currentUser.studentProfiles || [])];
  const uniqueProfiles = [...new Set(allProfiles)];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Meu Perfil</h1>
          <p className="text-gray-500">Visualize e edite seus dados pessoais</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white gap-2"
          >
            <Pencil className="w-4 h-4" />
            Editar Dados
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="p-6 bg-gradient-to-r from-[#22c55e]/5 via-[#3b82f6]/5 to-[#eab308]/5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#22c55e] to-[#3b82f6] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <p className="text-gray-500">{currentUser.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <Badge className="bg-[#3b82f6]/10 text-[#3b82f6]">
                <Shield className="w-3 h-3 mr-1" />
                {ROLE_LABELS[currentUser.role]}
              </Badge>
              {uniqueProfiles.map((p) => (
                <Badge
                  key={p}
                  style={{
                    backgroundColor: PROFILE_COLORS[p] + "18",
                    color: PROFILE_COLORS[p],
                  }}
                >
                  {PROFILE_NAMES[p]}
                  {currentUser.studentProfiles?.includes(p) && !currentUser.profiles.includes(p)
                    ? " (aluno)"
                    : currentUser.studentProfiles?.includes(p) && currentUser.profiles.includes(p)
                      ? " (staff + aluno)"
                      : ""}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* CPF - Read Only */}
      <Card className="p-5 border-l-4 border-amber-400 bg-amber-50/30">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">CPF</p>
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">
                Não editável
              </Badge>
            </div>
            <p className="text-lg font-mono tracking-wider text-gray-700">
              {formatCPF(currentUser.cpf)}
            </p>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Para alterar o CPF, entre em contato com a administração
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Data */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#22c55e]" />
            Dados Pessoais
          </h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-xs text-gray-500">Nome Completo</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">{currentUser.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs text-gray-500">E-mail</Label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {currentUser.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label className="text-xs text-gray-500">Telefone</Label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {currentUser.phone}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <Label className="text-xs text-gray-500">Data de Nascimento</Label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(currentUser.birthDate)}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <Label className="text-xs text-gray-500">Gênero</Label>
              {isEditing ? (
                <Select
                  value={formData.gender || ""}
                  onValueChange={(v) => handleChange("gender", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm font-medium">{GENDER_LABELS[currentUser.gender]}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#3b82f6]" />
            Endereço
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500">CEP</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address?.zipCode || ""}
                  onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  placeholder="00000-000"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">{currentUser.address.zipCode}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Rua</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address?.street || ""}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium">{currentUser.address.street}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500">Número</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address?.number || ""}
                    onChange={(e) => handleAddressChange("number", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium">{currentUser.address.number}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Complemento</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address?.complement || ""}
                  onChange={(e) => handleAddressChange("complement", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  placeholder="Apto , etc."
                />
              ) : (
                <p className="mt-1 text-sm font-medium">{currentUser.address.complement || "—"}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-gray-500">Bairro</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address?.neighborhood || ""}
                  onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">{currentUser.address.neighborhood}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Cidade</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address?.city || ""}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium">{currentUser.address.city}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500">Estado</Label>
                {isEditing ? (
                  <Select
                    value={formData.address?.state || ""}
                    onValueChange={(v) => handleAddressChange("state", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BR_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-sm font-medium">{currentUser.address.state}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Contato de Emergência
        </h3>
        {currentUser.emergencyContact || isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Nome</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) => handleEmergencyChange("name", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">{currentUser.emergencyContact?.name}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-500">Telefone</Label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergencyContact?.phone || ""}
                  onChange={(e) => handleEmergencyChange("phone", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                />
              ) : (
                <p className="mt-1 text-sm font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {currentUser.emergencyContact?.phone}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-500">Parentesco</Label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact?.relationship || ""}
                  onChange={(e) => handleEmergencyChange("relationship", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm"
                  placeholder="Ex: Mãe , Cônjuge..."
                />
              ) : (
                <p className="mt-1 text-sm font-medium">
                  {currentUser.emergencyContact?.relationship}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">Nenhum contato de emergência cadastrado.</p>
            <p className="text-xs mt-1">Clique em "Editar Dados" para adicionar.</p>
          </div>
        )}
      </Card>

      {/* Save floating for mobile when editing */}
      {isEditing && (
        <div className="sticky bottom-4 sm:hidden flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 gap-2 bg-white shadow-lg"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
};
