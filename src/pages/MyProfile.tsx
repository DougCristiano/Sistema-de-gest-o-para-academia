import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
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
  Camera,
  Loader2,
  GraduationCap,
  Briefcase,
  Info,
  CreditCard,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import {
  PROFILE_NAMES,
  PROFILE_COLORS,
  User,
  PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
} from "../types";
import { getUserSubscriptions } from "../data/mockData";
import { toast } from "sonner";

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

const GENDER_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  "prefiro-nao-informar": "Prefiro não informar",
};

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

const maskCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

interface FieldProps {
  label: string;
  value: string;
  icon?: React.ElementType;
  isEditing: boolean;
  type?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

const Field: React.FC<FieldProps> = ({
  label, value, icon: Icon, isEditing, type = "text", placeholder, onChange,
}) => (
  <div>
    <Label className="text-xs text-muted-foreground font-medium">{label}</Label>
    {isEditing ? (
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-9 text-sm"
      />
    ) : (
      <p className="mt-1 text-sm font-medium text-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
        {value || <span className="text-muted-foreground">—</span>}
      </p>
    )}
  </div>
);

export const MyProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!currentUser) return null;

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddressChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, address: { ...prev.address!, [field]: value } }));

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits;
    handleAddressChange("zipCode", formatted);
    setCepError("");

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepError("CEP não encontrado.");
        } else {
          setFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address!,
              zipCode: formatted,
              street: data.logradouro || prev.address?.street || "",
              neighborhood: data.bairro || prev.address?.neighborhood || "",
              city: data.localidade || prev.address?.city || "",
              state: data.uf || prev.address?.state || "",
            },
          }));
          toast.success("Endereço preenchido automaticamente!");
        }
      } catch {
        setCepError("Erro ao buscar CEP. Verifique sua conexão.");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleEmergencyChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, [field]: value } }));

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast.success("Foto atualizada!");
    }
  };

  const allProfiles = [...currentUser.profiles, ...(currentUser.studentProfiles || [])];
  const uniqueProfiles = [...new Set(allProfiles)];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* Profile Hero Card */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div
          className="h-28"
          style={{ background: "linear-gradient(135deg, #166534 0%, #16a34a 50%, #3b82f6 100%)" }}
        />

        {/* Avatar + info + actions */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative w-fit">
              <div className="w-24 h-24 rounded-full border-4 border-card shadow-lg overflow-hidden bg-gradient-to-br from-[#22c55e] to-[#3b82f6] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                title="Alterar foto"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:mb-1">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2">
                  <Pencil className="w-3.5 h-3.5" />
                  Editar Dados
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Name + role + badges */}
          <div className="mt-3">
            <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {currentUser.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[currentUser.role]}`}>
                <Shield className="w-3 h-3" />
                {ROLE_LABELS[currentUser.role]}
              </span>
              {uniqueProfiles.map((p) => {
                const isStudent = currentUser.studentProfiles?.includes(p);
                const isStaff = currentUser.profiles.includes(p);
                const icon = isStaff ? Briefcase : GraduationCap;
                const IconComp = icon;
                const label = isStudent && isStaff
                  ? `${PROFILE_NAMES[p]} · staff + aluno`
                  : isStudent
                  ? `${PROFILE_NAMES[p]} · aluno`
                  : PROFILE_NAMES[p];
                return (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: PROFILE_COLORS[p] + "18",
                      color: PROFILE_COLORS[p],
                      borderColor: PROFILE_COLORS[p] + "50",
                    }}
                  >
                    <IconComp className="w-3 h-3" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Personal + Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Data */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            Dados Pessoais
          </h3>
          <div className="space-y-4">
            <Field label="Nome Completo" value={formData.name || ""} isEditing={isEditing}
              onChange={(v) => handleChange("name", v)} />
            <Field label="E-mail" value={formData.email || ""} icon={Mail} isEditing={isEditing}
              type="email" onChange={(v) => handleChange("email", v)} />
            <Field label="Telefone" value={formData.phone || ""} icon={Phone} isEditing={isEditing}
              type="tel" onChange={(v) => handleChange("phone", v)} />
            <Field label="Data de Nascimento" value={isEditing ? (formData.birthDate || "") : formatDate(currentUser.birthDate)}
              icon={Calendar} isEditing={isEditing} type="date"
              onChange={(v) => handleChange("birthDate", v)} />
            <div>
              <Label className="text-xs text-muted-foreground font-medium">Sexo</Label>
              {isEditing ? (
                <Select value={formData.gender || ""} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
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
                <p className="mt-1 text-sm font-medium text-foreground">{GENDER_LABELS[currentUser.gender] || "—"}</p>
              )}
            </div>

            {/* CPF - dentro de dados pessoais */}
            <div className="pt-1">
              <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                CPF
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-600 border border-amber-200 dark:border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" />
                  Não editável
                </span>
              </Label>
              <p className="mt-1 text-sm font-mono tracking-widest text-foreground">
                {maskCPF(currentUser.cpf)}
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                Para alterar, entre em contato com a administração
              </p>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#3b82f6] rounded-full" />
            Endereço
          </h3>
          <div className="space-y-4">
            {/* CEP com busca automática */}
            <div>
              <Label className="text-xs text-muted-foreground font-medium">CEP</Label>
              {isEditing ? (
                <div className="relative mt-1">
                  <Input
                    value={formData.address?.zipCode || ""}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="h-9 text-sm pr-9"
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                  {!cepLoading && formData.address?.zipCode?.replace(/\D/g, "").length === 8 && !cepError && (
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {formData.address?.zipCode || "—"}
                </p>
              )}
              {cepError && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {cepError}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Rua" value={formData.address?.street || ""} isEditing={isEditing}
                  onChange={(v) => handleAddressChange("street", v)} />
              </div>
              <Field label="Número" value={formData.address?.number || ""} isEditing={isEditing}
                onChange={(v) => handleAddressChange("number", v)} />
            </div>
            <Field label="Complemento" value={formData.address?.complement || ""}
              isEditing={isEditing} placeholder="Apto, bloco..."
              onChange={(v) => handleAddressChange("complement", v)} />
            <Field label="Bairro" value={formData.address?.neighborhood || ""} isEditing={isEditing}
              onChange={(v) => handleAddressChange("neighborhood", v)} />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Cidade" value={formData.address?.city || ""} isEditing={isEditing}
                  onChange={(v) => handleAddressChange("city", v)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Estado</Label>
                {isEditing ? (
                  <Select value={formData.address?.state || ""} onValueChange={(v) => handleAddressChange("state", v)}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BR_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-sm font-medium text-foreground">{currentUser.address.state || "—"}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Vínculos & Atividades */}
      {(currentUser.profiles.length > 0 || (currentUser.studentProfiles && currentUser.studentProfiles.length > 0)) && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full" />
            Vínculos &amp; Atividades
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <Info className="w-3 h-3" />
              Somente leitura
            </span>
          </h3>

          <div className="space-y-5">
            {/* Matriculado como aluno */}
            {currentUser.studentProfiles && currentUser.studentProfiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Matriculado em
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.studentProfiles.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{
                        backgroundColor: PROFILE_COLORS[p] + "18",
                        color: PROFILE_COLORS[p],
                        borderColor: PROFILE_COLORS[p] + "50",
                      }}
                    >
                      <GraduationCap className="w-3 h-3" />
                      {PROFILE_NAMES[p]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Atua como staff */}
            {currentUser.profiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                  <Briefcase className="w-3.5 h-3.5" />
                  {currentUser.role === "admin"
                    ? "Administrador de"
                    : currentUser.role === "manager"
                    ? "Gerente de"
                    : currentUser.role === "teacher"
                    ? "Professor de"
                    : "Vinculado em"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.profiles.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{
                        backgroundColor: PROFILE_COLORS[p] + "18",
                        color: PROFILE_COLORS[p],
                        borderColor: PROFILE_COLORS[p] + "50",
                      }}
                    >
                      <Briefcase className="w-3 h-3" />
                      {PROFILE_NAMES[p]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Meus Planos */}
      {(() => {
        const subscriptions = getUserSubscriptions(currentUser.id);
        if (subscriptions.length === 0) return null;
        return (
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              Meus Planos
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                <Info className="w-3 h-3" />
                Somente leitura
              </span>
            </h3>

            <div className="space-y-4">
              {subscriptions.map((sub) => {
                const remaining = sub.classesPerMonth - sub.classesUsed;
                const pct = Math.min(100, Math.round((sub.classesUsed / sub.classesPerMonth) * 100));
                const barColor =
                  pct >= 100
                    ? "#ef4444"
                    : pct >= 75
                    ? "#eab308"
                    : PROFILE_COLORS[sub.profile];

                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
                  >
                    {/* Header: serviço + plano + status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: PROFILE_COLORS[sub.profile] + "18",
                          color: PROFILE_COLORS[sub.profile],
                          borderColor: PROFILE_COLORS[sub.profile] + "50",
                        }}
                      >
                        {PROFILE_NAMES[sub.profile]}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full bg-background border border-border">
                        {PLAN_LABELS[sub.planType]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${SUBSCRIPTION_STATUS_COLORS[sub.status]}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {SUBSCRIPTION_STATUS_LABELS[sub.status]}
                      </span>
                    </div>

                    {/* Corpo: aulas + preço */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Aulas do mês */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Aulas este mês
                          </span>
                          <span className="font-semibold text-foreground">
                            {sub.classesUsed}
                            <span className="text-muted-foreground font-normal"> / {sub.classesPerMonth}</span>
                          </span>
                        </div>
                        {/* Barra de progresso */}
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <p className="text-xs">
                          {remaining > 0 ? (
                            <span className="font-semibold" style={{ color: barColor }}>
                              {remaining} aula{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              Limite mensal atingido
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Preço + cobrança */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs font-medium">Valor mensal</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          R$ {sub.price.toLocaleString("pt-BR")}
                          <span className="text-xs text-muted-foreground font-normal">/mês</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" />
                          Próx. cobrança: <span className="font-medium text-foreground ml-0.5">{formatDate(sub.nextBillingDate)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rodapé: data de início */}
                    <p className="text-[11px] text-muted-foreground/70 border-t border-border pt-2">
                      Matriculado desde {formatDate(sub.startDate)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Emergency Contact */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-500 rounded-full" />
          Contato de Emergência
          <Heart className="w-3.5 h-3.5 text-red-500 ml-auto" />
        </h3>
        {currentUser.emergencyContact || isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nome" value={formData.emergencyContact?.name || ""} isEditing={isEditing}
              onChange={(v) => handleEmergencyChange("name", v)} />
            <Field label="Telefone" value={formData.emergencyContact?.phone || ""} icon={Phone}
              isEditing={isEditing} type="tel" onChange={(v) => handleEmergencyChange("phone", v)} />
            <Field label="Parentesco" value={formData.emergencyContact?.relationship || ""}
              isEditing={isEditing} placeholder="Ex: Mãe, Cônjuge..."
              onChange={(v) => handleEmergencyChange("relationship", v)} />
          </div>
        ) : (
          <div className="text-center py-6">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum contato de emergência cadastrado.</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Clique em "Editar Dados" para adicionar.</p>
          </div>
        )}
      </Card>

      {/* Mobile sticky save bar */}
      {isEditing && (
        <div className="sticky bottom-4 sm:hidden flex gap-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2 shadow-lg">
            <X className="w-4 h-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 gap-2 shadow-lg">
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </div>
      )}
    </div>
  );
};
