import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Activity, CalendarClock, Edit, Plus, Power, RotateCcw, Search, X } from "lucide-react";
import { profilesService, ServiceCatalogItem } from "../services/profiles.service";

interface ServiceFormState {
  name: string;
  managerId: string;
}

const INITIAL_FORM_STATE: ServiceFormState = {
  name: "",
  managerId: "",
};

export const AdminServices: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);

  // Activity management
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityServiceId, setActivityServiceId] = useState<string | null>(null);
  const [newActivityName, setNewActivityName] = useState("");
  const [activityError, setActivityError] = useState<string | null>(null);

  const refreshServices = () => {
    setServices(profilesService.getServiceCatalog());
  };

  useEffect(() => {
    refreshServices();
  }, []);

  useEffect(() => {
    const clearFeedback = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(clearFeedback);
    };
  }, [successMessage]);

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return services;
    }

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(term) || service.id.toLowerCase().includes(term)
    );
  }, [searchTerm, services]);

  const managerOptions = useMemo(() => profilesService.getManagerOptions(), []);

  const activityService = useMemo(
    () => services.find((s) => s.id === activityServiceId) || null,
    [services, activityServiceId]
  );

  const openCreateDialog = () => {
    setEditingService(null);
    setFormState(INITIAL_FORM_STATE);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: ServiceCatalogItem) => {
    setEditingService(service);
    setFormState({ name: service.name, managerId: service.managerId || "" });
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormState(INITIAL_FORM_STATE);
    setErrorMessage(null);
  };

  const handleSaveService = () => {
    try {
      if (editingService) {
        profilesService.updateServiceName(editingService.id, formState.name);
        profilesService.setServiceManager(editingService.id, formState.managerId || null);
        setSuccessMessage("Serviço atualizado com sucesso.");
      } else {
        const createdService = profilesService.createService(formState.name);
        if (formState.managerId) {
          profilesService.setServiceManager(createdService.id, formState.managerId);
        }
        setSuccessMessage("Serviço criado com sucesso.");
      }

      refreshServices();
      closeDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar serviço.";
      setErrorMessage(message);
    }
  };

  const handleToggleServiceStatus = (service: ServiceCatalogItem) => {
    try {
      if (service.active) {
        profilesService.deactivateService(service.id);
        setSuccessMessage("Serviço inativado com sucesso.");
      } else {
        profilesService.reactivateService(service.id);
        setSuccessMessage("Serviço reativado com sucesso.");
      }

      refreshServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar status.";
      setErrorMessage(message);
    }
  };

  const openActivityDialog = (service: ServiceCatalogItem) => {
    setActivityServiceId(service.id);
    setNewActivityName("");
    setActivityError(null);
    setActivityDialogOpen(true);
  };

  const handleAddActivity = () => {
    if (!activityServiceId || !newActivityName.trim()) { return; }
    try {
      profilesService.createActivity(activityServiceId, newActivityName);
      setNewActivityName("");
      setActivityError(null);
      refreshServices();
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : "Erro ao criar atividade.");
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!activityServiceId) { return; }
    try {
      profilesService.deleteActivity(activityServiceId, activityId);
      setActivityError(null);
      refreshServices();
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : "Erro ao remover atividade.");
    }
  };

  const activeCount = services.filter((service) => service.active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">Crie, edite e inative serviços. Gerencie as atividades de cada um.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Criar Serviço"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="service-name">Nome do serviço</Label>
                <Input
                  id="service-name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Huron Pilates"
                />
              </div>
              <div>
                <Label htmlFor="service-manager">Gerente Responsável</Label>
                <Select
                  value={formState.managerId || "none"}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      managerId: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger id="service-manager">
                    <SelectValue placeholder="Selecione um gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem gerente associado</SelectItem>
                    {managerOptions.map((manager) => (
                      <SelectItem key={manager.value} value={manager.value}>
                        {manager.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveService}>
                  {editingService ? "Salvar Alterações" : "Criar Serviço"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activity management dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Atividades — {activityService?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Atividades são as modalidades oferecidas dentro deste serviço. Professores são vinculados a atividades específicas.
            </p>

            {/* Current activities */}
            <div className="space-y-2">
              {activityService && activityService.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma atividade cadastrada.</p>
              ) : (
                activityService?.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                  >
                    <span className="text-sm font-medium">{activity.name}</span>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                      title="Remover atividade"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new activity */}
            <div className="flex gap-2">
              <Input
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { handleAddActivity(); } }}
                placeholder="Nova atividade (ex: Futevolei)"
                className="flex-1"
              />
              <Button
                onClick={handleAddActivity}
                disabled={!newActivityName.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {activityError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {activityError}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3">
          {successMessage}
        </div>
      )}

      {errorMessage && !isDialogOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de serviços</p>
          <p className="text-2xl font-bold">{services.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Inativos</p>
          <p className="text-2xl font-bold text-amber-600">{inactiveCount}</p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="Buscar por nome ou slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Nenhum serviço encontrado.</Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: service.color }}
                    />
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Gerente: {profilesService.getServiceManagerName(service.id) || "Não associado"}
                  </p>
                  {/* Activities */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {service.activities.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">Sem atividades cadastradas</span>
                    ) : (
                      service.activities.map((activity) => (
                        <Badge key={activity.id} variant="secondary" className="text-xs">
                          {activity.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openActivityDialog(service)}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Atividades
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/service-teachers?service=${service.id}`)}
                  >
                    <CalendarClock className="w-4 h-4 mr-1" />
                    Professores
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>

                  {service.active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-700 border-amber-300 hover:bg-amber-50"
                      onClick={() => handleToggleServiceStatus(service)}
                    >
                      <Power className="w-4 h-4 mr-1" />
                      Inativar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-50"
                      onClick={() => handleToggleServiceStatus(service)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reativar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
