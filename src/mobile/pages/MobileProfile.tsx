import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileCard } from "../components/MobileCard";
import { MobileButton } from "../components/MobileButton";
import { mobileTheme } from "../theme";
import { Mail, Phone, MapPin, Award, TrendingUp, Edit2, Save } from "lucide-react";

export const MobileProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const stats = [
    {
      label: "Aulas Realizadas",
      value: "24",
      icon: TrendingUp,
      color: mobileTheme.colors.primary,
    },
    {
      label: "Sequência de Dias",
      value: "12",
      icon: Award,
      color: mobileTheme.colors.success,
    },
  ];

  return (
    <MobileLayout title="Meu Perfil" showLogout>
      {currentUser && (
        <>
          {/* Profile Header */}
          <MobileCard gradient style={{ marginBottom: mobileTheme.spacing.lg }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: mobileTheme.spacing.lg,
                marginBottom: mobileTheme.spacing.lg,
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    ...mobileTheme.typography.h3,
                    color: "white",
                    margin: 0,
                    marginBottom: "4px",
                  }}
                >
                  {currentUser.name}
                </h2>
                <p
                  style={{
                    ...mobileTheme.typography.bodySmall,
                    color: "rgba(255, 255, 255, 0.9)",
                    margin: 0,
                  }}
                >
                  {currentUser.role === "student"
                    ? "Atleta"
                    : currentUser.role === "teacher"
                    ? "Professor"
                    : currentUser.role === "manager"
                    ? "Gerente"
                    : "Admin"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: mobileTheme.spacing.md }}>
              <MobileButton
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                style={{ flex: 1 }}
              >
                <Edit2 size={16} />
                {isEditing ? "Cancelar" : "Editar"}
              </MobileButton>
            </div>
          </MobileCard>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobileTheme.spacing.md, marginBottom: mobileTheme.spacing.lg }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <MobileCard key={stat.label}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: mobileTheme.spacing.md,
                      marginBottom: mobileTheme.spacing.sm,
                    }}
                  >
                    <Icon size={24} color={stat.color} />
                  </div>
                  <p
                    style={{
                      ...mobileTheme.typography.h3,
                      margin: 0,
                      marginBottom: "4px",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      ...mobileTheme.typography.caption,
                      margin: 0,
                      color: mobileTheme.colors.textSecondary,
                    }}
                  >
                    {stat.label}
                  </p>
                </MobileCard>
              );
            })}
          </div>

          {/* Form */}
          {isEditing ? (
            <MobileCard>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                style={{ display: "flex", flexDirection: "column", gap: mobileTheme.spacing.md }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      ...mobileTheme.typography.caption,
                      color: mobileTheme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    style={{
                      width: "100%",
                      padding: mobileTheme.spacing.md,
                      border: `1px solid ${mobileTheme.colors.border}`,
                      borderRadius: mobileTheme.borderRadius.md,
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      ...mobileTheme.typography.caption,
                      color: mobileTheme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    style={{
                      width: "100%",
                      padding: mobileTheme.spacing.md,
                      border: `1px solid ${mobileTheme.colors.border}`,
                      borderRadius: mobileTheme.borderRadius.md,
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      ...mobileTheme.typography.caption,
                      color: mobileTheme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    style={{
                      width: "100%",
                      padding: mobileTheme.spacing.md,
                      border: `1px solid ${mobileTheme.colors.border}`,
                      borderRadius: mobileTheme.borderRadius.md,
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      ...mobileTheme.typography.caption,
                      color: mobileTheme.colors.textSecondary,
                      marginBottom: "4px",
                    }}
                  >
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    style={{
                      width: "100%",
                      padding: mobileTheme.spacing.md,
                      border: `1px solid ${mobileTheme.colors.border}`,
                      borderRadius: mobileTheme.borderRadius.md,
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <MobileButton type="submit" fullWidth>
                  <Save size={16} />
                  Salvar Alterações
                </MobileButton>
              </form>
            </MobileCard>
          ) : (
            <MobileCard>
              <div style={{ display: "flex", flexDirection: "column", gap: mobileTheme.spacing.lg }}>
                <div style={{ display: "flex", alignItems: "center", gap: mobileTheme.spacing.md }}>
                  <Mail size={20} color={mobileTheme.colors.primary} />
                  <div>
                    <p
                      style={{
                        ...mobileTheme.typography.caption,
                        color: mobileTheme.colors.textSecondary,
                        margin: 0,
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        ...mobileTheme.typography.body,
                        margin: 0,
                        color: mobileTheme.colors.textPrimary,
                      }}
                    >
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: mobileTheme.spacing.md }}>
                  <Phone size={20} color={mobileTheme.colors.primary} />
                  <div>
                    <p
                      style={{
                        ...mobileTheme.typography.caption,
                        color: mobileTheme.colors.textSecondary,
                        margin: 0,
                      }}
                    >
                      Telefone
                    </p>
                    <p
                      style={{
                        ...mobileTheme.typography.body,
                        margin: 0,
                        color: mobileTheme.colors.textPrimary,
                      }}
                    >
                      {currentUser.phone || "Não informado"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: mobileTheme.spacing.md }}>
                  <MapPin size={20} color={mobileTheme.colors.primary} />
                  <div>
                    <p
                      style={{
                        ...mobileTheme.typography.caption,
                        color: mobileTheme.colors.textSecondary,
                        margin: 0,
                      }}
                    >
                      Endereço
                    </p>
                    <p
                      style={{
                        ...mobileTheme.typography.body,
                        margin: 0,
                        color: mobileTheme.colors.textPrimary,
                      }}
                    >
                      {currentUser.address || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            </MobileCard>
          )}

          {/* Plan Info */}
          {currentUser.plan && (
            <MobileCard style={{ marginTop: mobileTheme.spacing.lg }}>
              <h3
                style={{
                  ...mobileTheme.typography.h4,
                  margin: 0,
                  marginBottom: mobileTheme.spacing.md,
                  color: mobileTheme.colors.primary,
                }}
              >
                Plano Atual
              </h3>
              <p
                style={{
                  ...mobileTheme.typography.body,
                  margin: 0,
                  textTransform: "capitalize",
                  color: mobileTheme.colors.textPrimary,
                }}
              >
                {currentUser.plan}
              </p>
            </MobileCard>
          )}
        </>
      )}
    </MobileLayout>
  );
};
