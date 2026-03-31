import React, { useEffect, useMemo, useState } from "react";
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
import { Edit, Plus, Power, RotateCcw, Search } from "lucide-react";
import { profilesService, ServiceCatalogItem } from "../services/profiles.service";

interface ServiceFormState {
  name: string;
}

const INITIAL_FORM_STATE: ServiceFormState = {
  name: "",
};

export const AdminServices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);

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

  const openCreateDialog = () => {
    setEditingService(null);
    setFormState(INITIAL_FORM_STATE);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: ServiceCatalogItem) => {
    setEditingService(service);
    setFormState({ name: service.name });
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
        setSuccessMessage("Servico atualizado com sucesso.");
      } else {
        profilesService.createService(formState.name);
        setSuccessMessage("Servico criado com sucesso.");
      }

      refreshServices();
      closeDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar servico.";
      setErrorMessage(message);
    }
  };

  const handleToggleServiceStatus = (service: ServiceCatalogItem) => {
    try {
      if (service.active) {
        profilesService.deactivateService(service.id);
        setSuccessMessage("Servico inativado com sucesso.");
      } else {
        profilesService.reactivateService(service.id);
        setSuccessMessage("Servico reativado com sucesso.");
      }

      refreshServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar status.";
      setErrorMessage(message);
    }
  };

  const activeCount = services.filter((service) => service.active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Servicos</h1>
          <p className="text-gray-600">Crie, edite e inative servicos para uso futuro no sistema.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Servico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Servico" : "Criar Servico"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="service-name">Nome do servico</Label>
                <Input
                  id="service-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ name: e.target.value })}
                  placeholder="Ex: Huron Pilates"
                />
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
                  {editingService ? "Salvar Alteracoes" : "Criar Servico"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
          <p className="text-sm text-gray-500">Total de servicos</p>
          <p className="text-2xl font-bold">{services.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Inativos</p>
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
          <Card className="p-8 text-center text-gray-500">Nenhum servico encontrado.</Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Slug: {service.id}</p>
                  <p className="text-xs text-gray-400">
                    Atualizado em {new Date(service.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
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
