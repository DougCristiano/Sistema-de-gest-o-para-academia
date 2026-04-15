import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { AlertCircle, CalendarClock, ChevronDown, ChevronUp, Plus, Save, Tag, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  ClassSlotOverride,
  createDefaultTeacherSchedule,
  profilesService,
  SERVICE_WEEK_DAYS,
  ServiceCatalogItem,
  ServiceTeacherAssignment,
  ServiceTeacherDaySchedule,
  ServiceTeacherSchedule,
  ServiceWeekDayKey,
} from "../services/profiles.service";

interface OverrideFormState {
  date: string;
  maxStudents: string;
  blocked: boolean;
  notes: string;
}

const BLANK_OVERRIDE_FORM: OverrideFormState = {
  date: "",
  maxStudents: "10",
  blocked: false,
  notes: "",
};

const cloneAssignments = (teachers: ServiceTeacherAssignment[]): ServiceTeacherAssignment[] => {
  return teachers.map((teacher) => ({
    teacherId: teacher.teacherId,
    activityIds: [...teacher.activityIds],
    schedule: SERVICE_WEEK_DAYS.reduce((acc, day) => {
      acc[day.key] = { ...teacher.schedule[day.key] };
      return acc;
    }, {} as ServiceTeacherSchedule),
  }));
};

export const ServiceTeachersConfig: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [assignments, setAssignments] = useState<ServiceTeacherAssignment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedOverrideTeacher, setExpandedOverrideTeacher] = useState<string | null>(null);
  const [overrideForms, setOverrideForms] = useState<Record<string, OverrideFormState>>({});

  const isAdmin = currentUser?.role === "admin";
  const isManager = currentUser?.role === "manager";
  const canConfigure = isAdmin || isManager;

  const refreshServices = () => {
    setServices(profilesService.getServiceCatalog());
  };

  useEffect(() => {
    refreshServices();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage]);

  const managedServiceIds = useMemo(() => {
    if (!isManager || !currentUser) {
      return [];
    }

    return profilesService.getManagedServiceIds(currentUser.id, true);
  }, [currentUser, isManager]);

  const scopedServices = useMemo(() => {
    if (isAdmin) {
      return services;
    }

    if (isManager) {
      return services.filter((service) => managedServiceIds.includes(service.id));
    }

    return [];
  }, [isAdmin, isManager, managedServiceIds, services]);

  const requestedServiceId = searchParams.get("service");

  useEffect(() => {
    if (requestedServiceId && scopedServices.some((service) => service.id === requestedServiceId)) {
      if (requestedServiceId !== selectedServiceId) {
        setSelectedServiceId(requestedServiceId);
      }
      return;
    }

    if (!scopedServices.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(scopedServices[0]?.id || "");
    }
  }, [requestedServiceId, scopedServices, selectedServiceId]);

  useEffect(() => {
    if (!selectedServiceId) {
      setAssignments([]);
      return;
    }

    setAssignments(cloneAssignments(profilesService.getServiceTeachers(selectedServiceId)));
    setSelectedTeacherId("");
    setErrorMessage(null);
  }, [selectedServiceId]);

  const selectedService = scopedServices.find((service) => service.id === selectedServiceId) || null;

  const teacherOptions = useMemo(() => profilesService.getTeacherOptions(), []);

  const teacherById = useMemo(() => {
    return new Map(teacherOptions.map((teacher) => [teacher.value, teacher]));
  }, [teacherOptions]);

  const availableTeachers = useMemo(() => {
    return teacherOptions.filter(
      (teacher) => !assignments.some((assignment) => assignment.teacherId === teacher.value)
    );
  }, [assignments, teacherOptions]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("service", serviceId);
    setSearchParams(nextParams);
  };

  const handleAddTeacher = () => {
    if (!selectedTeacherId) {
      return;
    }

    setAssignments((prev) => [
      ...prev,
      {
        teacherId: selectedTeacherId,
        activityIds: [],
        schedule: createDefaultTeacherSchedule(),
      },
    ]);
    setSelectedTeacherId("");
    setErrorMessage(null);
  };

  const toggleTeacherActivity = (teacherId: string, activityId: string) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.teacherId !== teacherId) { return assignment; }
        const has = assignment.activityIds.includes(activityId);
        return {
          ...assignment,
          activityIds: has
            ? assignment.activityIds.filter((id) => id !== activityId)
            : [...assignment.activityIds, activityId],
        };
      })
    );
    setErrorMessage(null);
  };

  const handleRemoveTeacher = (teacherId: string) => {
    setAssignments((prev) => prev.filter((assignment) => assignment.teacherId !== teacherId));
    setErrorMessage(null);
  };

  const updateTeacherDay = (
    teacherId: string,
    dayKey: ServiceWeekDayKey,
    updates: Partial<ServiceTeacherDaySchedule>
  ) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.teacherId !== teacherId) {
          return assignment;
        }

        return {
          ...assignment,
          schedule: {
            ...assignment.schedule,
            [dayKey]: {
              ...assignment.schedule[dayKey],
              ...updates,
            },
          },
        };
      })
    );
    setErrorMessage(null);
  };

  const getOverrideForm = (teacherId: string): OverrideFormState =>
    overrideForms[teacherId] ?? BLANK_OVERRIDE_FORM;

  const setOverrideForm = (teacherId: string, patch: Partial<OverrideFormState>) => {
    setOverrideForms((prev) => ({
      ...prev,
      [teacherId]: { ...(prev[teacherId] ?? BLANK_OVERRIDE_FORM), ...patch },
    }));
  };

  const handleAddOverride = (teacherId: string) => {
    if (!selectedService) { return; }
    const form = getOverrideForm(teacherId);
    if (!form.date) { return; }

    try {
      profilesService.addClassSlotOverride(selectedService.id, {
        teacherId,
        date: form.date,
        maxStudents: form.blocked ? null : Math.max(1, parseInt(form.maxStudents) || 1),
        notes: form.notes.trim() || undefined,
      });
      setOverrideForms((prev) => ({ ...prev, [teacherId]: BLANK_OVERRIDE_FORM }));
      refreshServices();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao adicionar exceção.");
    }
  };

  const handleRemoveOverride = (overrideId: string) => {
    if (!selectedService) { return; }
    try {
      profilesService.removeClassSlotOverride(selectedService.id, overrideId);
      refreshServices();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao remover exceção.");
    }
  };

  const handleSave = () => {
    if (!selectedService) {
      return;
    }

    try {
      const updatedService = profilesService.setServiceTeachers(selectedService.id, assignments);
      setAssignments(cloneAssignments(updatedService.teachers));
      setSuccessMessage("Professores e horarios salvos com sucesso.");
      setErrorMessage(null);
      refreshServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar configuracao.";
      setErrorMessage(message);
      setSuccessMessage(null);
    }
  };

  if (!canConfigure) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h1 className="text-xl font-semibold mb-2">Acesso restrito</h1>
        <p className="text-gray-600">
          Apenas admin e manager podem configurar professores e horarios por servico.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Professores e Horarios por Servico</h1>
        <p className="text-gray-600">
          Defina os professores de cada servico e configure a disponibilidade semanal de cada um.
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
          {errorMessage}
        </div>
      )}

      {isManager && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">
            Voce pode editar apenas os servicos em que esta definido como responsavel.
          </p>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service-select">Servico</Label>
          <Select
            value={selectedServiceId || "none"}
            onValueChange={(value) => handleServiceChange(value === "none" ? "" : value)}
          >
            <SelectTrigger id="service-select">
              <SelectValue placeholder="Selecione um servico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>
                Selecione um servico
              </SelectItem>
              {scopedServices.length === 0 ? (
                <SelectItem value="none-empty" disabled>
                  Nenhum servico disponivel
                </SelectItem>
              ) : (
                scopedServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedService && (
          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
            <Badge variant={selectedService.active ? "default" : "secondary"}>
              {selectedService.active ? "Ativo" : "Inativo"}
            </Badge>
            <span>
              Responsavel: {profilesService.getServiceManagerName(selectedService.id) || "Nao associado"}
            </span>
          </div>
        )}
      </Card>

      {!selectedService ? (
        <Card className="p-8 text-center text-gray-600">
          Nenhum servico disponivel para configuracao.
        </Card>
      ) : (
        <>
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold">Professores vinculados</h2>
                <p className="text-sm text-gray-600">
                  Adicione professores ao servico e ajuste os horarios por dia da semana.
                </p>
              </div>
              <div className="text-sm text-gray-500">{assignments.length} professor(es)</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <Select
                value={selectedTeacherId || "none"}
                onValueChange={(value) => setSelectedTeacherId(value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Selecione um professor
                  </SelectItem>
                  {availableTeachers.length === 0 ? (
                    <SelectItem value="none-empty" disabled>
                      Todos os professores ja estao vinculados
                    </SelectItem>
                  ) : (
                    availableTeachers.map((teacher) => (
                      <SelectItem key={teacher.value} value={teacher.value}>
                        {teacher.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddTeacher}
                disabled={!selectedTeacherId || availableTeachers.length === 0}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          {assignments.length === 0 ? (
            <Card className="p-8 text-center text-gray-600">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              Nenhum professor vinculado a este servico.
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const teacher = teacherById.get(assignment.teacherId);

                return (
                  <Card key={assignment.teacherId} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-lg">{teacher?.label || assignment.teacherId}</h3>
                        <p className="text-sm text-gray-500">{teacher?.email || "Email nao encontrado"}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTeacher(assignment.teacherId)}
                      >
                        Remover
                      </Button>
                    </div>

                    {/* Activities */}
                    {selectedService && selectedService.activities.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Atividades que leciona</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedService.activities.map((activity) => {
                            const isSelected = assignment.activityIds.includes(activity.id);
                            return (
                              <button
                                key={activity.id}
                                type="button"
                                onClick={() => toggleTeacherActivity(assignment.teacherId, activity.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {activity.name}
                              </button>
                            );
                          })}
                        </div>
                        {assignment.activityIds.length === 0 && (
                          <p className="text-xs text-amber-600">Selecione ao menos uma atividade.</p>
                        )}
                      </div>
                    )}

                    {/* Overrides section */}
                    {(() => {
                      const teacherOverrides: ClassSlotOverride[] = selectedService
                        ? profilesService.getClassSlotOverrides(selectedService.id, assignment.teacherId)
                        : [];
                      const form = getOverrideForm(assignment.teacherId);
                      const isExpanded = expandedOverrideTeacher === assignment.teacherId;

                      return (
                        <div className="border rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOverrideTeacher(isExpanded ? null : assignment.teacherId)
                            }
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors rounded-md"
                          >
                            <span className="flex items-center gap-2">
                              Exceções pontuais
                              {teacherOverrides.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {teacherOverrides.length}
                                </Badge>
                              )}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t pt-3">
                              <p className="text-xs text-muted-foreground">
                                Defina um limite diferente (ou bloqueio) para uma data específica, sobrepondo o limite recorrente do dia.
                              </p>

                              {teacherOverrides.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Nenhuma exceção cadastrada.</p>
                              ) : (
                                <div className="space-y-2">
                                  {teacherOverrides
                                    .sort((a, b) => a.date.localeCompare(b.date))
                                    .map((override) => (
                                      <div
                                        key={override.id}
                                        className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2 text-sm"
                                      >
                                        <span className="font-medium tabular-nums">
                                          {override.date}
                                        </span>
                                        <span
                                          className={
                                            override.maxStudents === null
                                              ? "text-red-600 dark:text-red-400 font-medium"
                                              : "text-foreground"
                                          }
                                        >
                                          {override.maxStudents === null
                                            ? "Bloqueado"
                                            : `${override.maxStudents} aluno${override.maxStudents !== 1 ? "s" : ""}`}
                                        </span>
                                        {override.notes && (
                                          <span className="text-muted-foreground flex-1 truncate">
                                            {override.notes}
                                          </span>
                                        )}
                                        <button
                                          onClick={() => handleRemoveOverride(override.id)}
                                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                                          title="Remover exceção"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {/* Add form */}
                              <div className="flex flex-wrap gap-2 items-end pt-1">
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">Data</p>
                                  <Input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) =>
                                      setOverrideForm(assignment.teacherId, { date: e.target.value })
                                    }
                                    className="h-8 text-xs w-36"
                                  />
                                </div>

                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">Máx. alunos</p>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={form.maxStudents}
                                    onChange={(e) =>
                                      setOverrideForm(assignment.teacherId, { maxStudents: e.target.value })
                                    }
                                    disabled={form.blocked}
                                    className="h-8 text-xs w-20"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pb-0.5">
                                  <Switch
                                    id={`blocked-${assignment.teacherId}`}
                                    checked={form.blocked}
                                    onCheckedChange={(checked) =>
                                      setOverrideForm(assignment.teacherId, { blocked: checked })
                                    }
                                  />
                                  <Label
                                    htmlFor={`blocked-${assignment.teacherId}`}
                                    className="text-xs cursor-pointer"
                                  >
                                    Bloquear
                                  </Label>
                                </div>

                                <div className="flex-1 min-w-[120px]">
                                  <p className="text-[10px] text-muted-foreground mb-1">Observação (opcional)</p>
                                  <Input
                                    value={form.notes}
                                    onChange={(e) =>
                                      setOverrideForm(assignment.teacherId, { notes: e.target.value })
                                    }
                                    placeholder="Ex: Feriado, manutenção…"
                                    className="h-8 text-xs"
                                  />
                                </div>

                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleAddOverride(assignment.teacherId)}
                                  disabled={!form.date}
                                  className="h-8"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                      {SERVICE_WEEK_DAYS.map((day) => {
                        const daySchedule = assignment.schedule[day.key];

                        return (
                          <div key={`${assignment.teacherId}-${day.key}`} className="border rounded-md p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{day.shortLabel}</p>
                              <Switch
                                checked={daySchedule.enabled}
                                onCheckedChange={(checked) =>
                                  updateTeacherDay(assignment.teacherId, day.key, { enabled: checked })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="time"
                                value={daySchedule.startTime}
                                onChange={(event) =>
                                  updateTeacherDay(assignment.teacherId, day.key, {
                                    startTime: event.target.value,
                                  })
                                }
                                disabled={!daySchedule.enabled}
                              />
                              <Input
                                type="time"
                                value={daySchedule.endTime}
                                onChange={(event) =>
                                  updateTeacherDay(assignment.teacherId, day.key, {
                                    endTime: event.target.value,
                                  })
                                }
                                disabled={!daySchedule.enabled}
                              />
                              {daySchedule.enabled && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">Máx. alunos</p>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={daySchedule.maxStudents ?? 10}
                                    onChange={(event) =>
                                      updateTeacherDay(assignment.teacherId, day.key, {
                                        maxStudents: Math.max(1, parseInt(event.target.value) || 1),
                                      })
                                    }
                                    className="h-7 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar configuracao
            </Button>
          </div>
        </>
      )}

      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarClock className="w-4 h-4" />
          Professores visualizam a agenda no painel deles, mas as alteracoes desta tela ficam restritas a
          admin e manager.
        </div>
      </Card>
    </div>
  );
};
