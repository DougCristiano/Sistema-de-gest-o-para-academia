# 📚 Guia de Uso - Serviços, Hooks e Componentes

## 🔧 Serviços - Como Usar

### 1. `authService` - Autenticação

```typescript
import { authService } from '@/services';

// Fazer login
const user = authService.login("email@academia.com", "senha");
if (user) {
  console.log("Login sucesso!");
}

// Verificar permissão
const temAccesso = authService.hasPermission(user, ["admin", "manager"]);

// Atualizar perfil
const updated = authService.updateProfile(userId, { phone: "..." });
```

---

### 2. `usersService` - Gestão de Usuários

```typescript
import { usersService } from '@/services';

// Obter usuários
const todos = usersService.getAllUsers();
const admins = usersService.getUsersByRole("admin");
const gerentos = usersService.getManageableUsers(); // Excluindo estudantes

// Buscar
const encontrado = usersService.getUserById("user-1");
const porEmail = usersService.getUserByEmail("email@academia.com");

// CRUD
const novo = usersService.createUser({ name: "João", email: "...", ... });
const atualizado = usersService.updateUser(userId, { phone: "..." });
const deletado = usersService.deleteUser(userId);

// Filtrar
const professores = usersService.getTeachersByProfile("huron-areia");
const resultado = usersService.searchUsers("joão", "teacher");

// Estatísticas
const contagem = usersService.getUserCountByRole();
// { admin: 1, manager: 3, teacher: 4, student: 12 }

// Gerenciar perfis
usersService.addProfileToUser(userId, "huron-areia");
usersService.removeProfileFromUser(userId, "huron-personal");
```

---

### 3. `athletesService` - Gestão de Atletas

```typescript
import { athletesService } from '@/services';

// Listar
const todos = athletesService.getAllAthletes();
const doHuronAreia = athletesService.getAthletesByProfile("huron-areia");
const ativos = athletesService.getAthletesByStatus("ativo");

// Filtrar
const treinarIAgora = athletesService.getAthletsTrainingNow();
const procurando = athletesService.searchAthletes("joão");
const comCheckInBaixo = athletesService.getAthletsWithLowCheckIns(50);
const topStreaks = athletesService.getTopAthletesByStreak(10);

// CRUD
const novo = athletesService.createAthlete({ name: "...", ... });
const atualizado = athletesService.updateAthlete(id, { status: "inativo" });
const deletado = athletesService.deleteAthlete(id);

// Estatísticas
const stats = athletesService.getStatistics();
// { total, active, inactive, pending, trainingNow, avgSessions, avgCompletionRate }

const distrib = athletesService.getAthleteDistributionByProfile();
// { "huron-areia": 45, "huron-personal": 38, ... }
```

---

### 4. `appointmentsService` - Agendamentos

```typescript
import { appointmentsService } from '@/services';

// Listar
const todos = appointmentsService.getAllAppointments();
const doAluno = appointmentsService.getAppointmentsByStudent(studentId);
const doProfessor = appointmentsService.getAppointmentsByTeacher(teacherId);
const doHoje = appointmentsService.getAppointmentsToday();
const semana = appointmentsService.getAppointmentsThisWeek();

// Filtrar avançado
const filtrados = appointmentsService.filterAppointments({
  profile: "huron-areia",
  status: "scheduled",
  dateFrom: new Date(),
  teacherId: "teacher-1"
});

// Modificar status
appointmentsService.completeAppointment(id); // Concluído
appointmentsService.cancelAppointment(id);   // Cancelado
appointmentsService.confirmAppointment(id);  // Agendado

// CRUD
const novo = appointmentsService.createAppointment({...});
const atualizado = appointmentsService.updateAppointment(id, {...});
const deletado = appointmentsService.deleteAppointment(id);

// Estatísticas
const stats = appointmentsService.getStatistics();
// { total, scheduled, completed, cancelled, today, week }

const porHora = appointmentsService.getAppointmentsByHour(new Date());
// { "09:00": [...], "10:00": [...], ... }
```

---

### 5. `newsService` - Notícias e Comentários

```typescript
import { newsService } from '@/services';

// Listar
const todas = newsService.getAllNews();
const promocoes = newsService.getNewsByType("promotion");
const doHuronAreia = newsService.getNewsByProfile("huron-areia");

// Para usuário específico
const visivel = newsService.getNewsForUser(["huron-areia", "huron-personal"]);

// CRUD Notícia
const nova = newsService.createNews({
  title: "...",
  content: "...",
  type: "announcement",
  profiles: ["huron-areia"],
  ...
});
const atualizada = newsService.updateNews(id, { title: "..." });
const deletada = newsService.deleteNews(id);

// Comentários
const comComentario = newsService.addComment(newsId, {
  authorId: "...",
  authorName: "...",
  content: "Ótima notícia!",
  ...
});
const semComentario = newsService.removeComment(newsId, commentId);
const comentarioAtual = newsService.updateComment(newsId, commentId, { content: "..." });

// Likes
newsService.likeNews(newsId);
newsService.unlikeNews(newsId);
newsService.likeComment(newsId, commentId);
newsService.unlikeComment(newsId, commentId);

// Estatísticas
const stats = newsService.getStatistics();
const porData = newsService.getNewsOrderedByDate();
const populares = newsService.getNewsOrderedByLikes();
```

---

### 6. `profilesService` - Configurações de Serviços

```typescript
import { profilesService } from '@/services';

// Listar perfis
const todos = profilesService.getAllProfiles();
const nome = profilesService.getProfileName("huron-areia"); // "Huron Areia"
const cor = profilesService.getProfileColor("huron-areia");  // "#22c55e"

// Estatísticas
const stats = profilesService.getProfileStats("huron-areia");
const peakHours = profilesService.getPeakHours();
const semanal = profilesService.getWeeklyAppointments();
const crescimento = profilesService.getMonthlyGrowth();
const distrib = profilesService.getProfileDistribution();

// Configuração
const config = profilesService.getProfileConfig("huron-areia");
const atualizada = profilesService.updateProfileConfig("huron-areia", { 
  maxStudentsPerSlot: 20 
});

// Resumo
const resumo = profilesService.getProfilesSummary();
// [{ profile, name, color, stats }, ...]

const opcoes = profilesService.getProfilesAsOptions();
// [{ value, label, color }, ...]
```

---

## 🪝 Hooks - Como Usar

### useFilter + useSearch + useSort + usePagination

```typescript
import { useDataList } from '@/hooks';

export const MyListPage = () => {
  const data = usersService.getManageableUsers();
  
  const {
    // Dados após todas transformações
    data: paginatedData,
    allData,
    itemsCount,
    filteredCount,
    searchedCount,
    
    // Busca
    searchTerm,
    setSearch,
    clearSearch,
    
    // Filtros
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    
    // Ordenação
    sortField,
    sortDir,
    toggleSort,
    
    // Paginação
    page,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = useDataList(data, {
    searchFields: ['name', 'email'],
    filterFields: ['role', 'status'],
    sortDefaultField: 'name',
    pageSize: 20,
    initialFilters: { role: 'teacher' }
  });

  return (
    <div>
      <Input 
        value={searchTerm}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
      />
      
      <Select value={filters.role || ''}>
        {/* Opções */}
      </Select>
      
      <table>
        <tbody>
          {paginatedData.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Button onClick={nextPage} disabled={!hasNextPage}>
        Próximo
      </Button>
    </div>
  );
};
```

---

### useAsync - Para operações futuras com backend

```typescript
import { useAsync } from '@/hooks';

export const MyComponent = () => {
  const { data, loading, error, run, reset } = useAsync(
    () => usersService.getAllUsers(),
    { immediate: true }
  );
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return <div>{data?.length} usuários</div>;
};
```

---

## 🎨 Componentes Genéricos - Como Usar

### DataTable

```typescript
import { DataTable } from '@/components/common';

<DataTable
  data={users}
  columns={[
    { 
      key: 'name', 
      label: 'Nome',
      sortable: true,
      width: '30%'
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (value) => <a href={`mailto:${value}`}>{value}</a>
    },
    { 
      key: 'role',
      label: 'Função',
      render: (value) => <Badge>{value}</Badge>
    },
  ]}
  actions={[
    { 
      label: 'Editar',
      icon: EditIcon,
      onClick: (user) => handleEdit(user.id)
    },
    { 
      label: 'Deletar',
      icon: TrashIcon,
      variant: 'destructive',
      onClick: (user) => handleDelete(user.id)
    },
  ]}
  onSort={(field, dir) => {
    // User clicou em ordenação
  }}
/>
```

---

### FilterBar

```typescript
import { FilterBar } from '@/components/common';

<FilterBar
  searchTerm={search}
  onSearchChange=(setSearch}
  filters={filters}
  onFilterChange={(key, value) => addFilter(key, value)}
  onFilterRemove={(key) => removeFilter(key)}
  filterConfigs={[
    {
      key: 'role',
      label: 'Função',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Gerente' },
        { value: 'teacher', label: 'Professor' },
      ]
    },
    {
      key: 'name',
      label: 'Nome',
      type: 'text',
      placeholder: 'Filtrar por nome'
    },
  ]}
/>
```

---

### FormDialog

```typescript
import { FormDialog } from '@/components/common';

const [isOpen, setIsOpen] = useState(false);

<FormDialog
  title="Criar Novo Usuário"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  fields={[
    {
      name: 'name',
      label: 'Nome Completo',
      type: 'text',
      required: true,
      placeholder: 'João Silva'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true
    },
    {
      name: 'role',
      label: 'Função',
      type: 'select',
      options: [
        { value: 'manager', label: 'Gerente' },
        { value: 'teacher', label: 'Professor' },
      ],
      required: true
    },
  ]}
  onSubmit={(data) => {
    usersService.createUser(data);
    setIsOpen(false);
  }}
  submitLabel="Criar"
/>
```

---

### ListContainer + PaginationControls

```typescript
import { ListContainer, PaginationControls } from '@/components/common';

<ListContainer
  title="Gerenciar Usuários"
  subtitle="Administrador de usuários"
  headerAction={
    <Button onClick={() => setIsDialogOpen(true)}>
      Novo Usuário
    </Button>
  }
  toolbar={
    <FilterBar {...filterProps} />
  }
>
  <DataTable {...tableProps} />
  
  <PaginationControls
    currentPage={page}
    totalPages={totalPages}
    hasNextPage={hasNextPage}
    hasPreviousPage={hasPreviousPage}
    onNextPage={nextPage}
    onPreviousPage={previousPage}
    itemsCount={itemsCount}
    pageSize={20}
  />
</ListContainer>
```

---

## 🔐 Proteção de Rotas - Como Usar

### No `routes.tsx`

```typescript
import { RequireRole } from '@/components';

{
  path: '/admin',
  element: <RequireRole roles={['admin']}>
    <AdminDashboard />
  </RequireRole>
},
{
  path: '/student',
  element: <RequireRole roles={['student', 'manager', 'teacher']}>
    <StudentDashboard />
  </RequireRole>
}
```

---

## 💾 Cache - Como Usar

```typescript
import { cache, withCache } from '@/stores/cache';

// Uso manual
cache.set('users', usuarios);
const usuarios = cache.get('users');
cache.remove('users');
cache.clear();

// Com helper
const users = await withCache('users', () => usersService.getAllUsers(), 300000);

// Invalidar
invalidateCache('users');
```

---

## 🚨 Error Handling - Como Usar

### Global (Toast)

```typescript
import { useErrorHandler } from '@/context/ErrorContext';

const MyComponent = () => {
  const { addError } = useErrorHandler();
  
  const handleCreate = async () => {
    try {
      const user = usersService.createUser(formData);
    } catch (err) {
      addError('Erro ao criar usuário', 5000);
    }
  };
};
```

### Error Boundary

```tsx
import { ErrorBoundary } from '@/components';

<ErrorBoundary
  fallback={(error) => (
    <div className="p-4 bg-red-50">
      <h2>Erro: {error.message}</h2>
      <button onClick={() => window.location.reload()}>
        Recarregar página
      </button>
    </div>
  )}
>
  <MyRiskyComponent />
</ErrorBoundary>
```

---

## ✨ Template Completo - Página Refatorada

```typescript
import { useState } from 'react';
import { useDataList } from '@/hooks';
import { usersService } from '@/services';
import { ListContainer, DataTable, FilterBar, FormDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus } from 'lucide-react';

export const AdminUsersRefactored = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const users = usersService.getManageableUsers();
  
  const { data, search, setSearch, filters, addFilter, removeFilter, 
    clearFilters, sortField, sortDir, toggleSort } = useDataList(users, {
    searchFields: ['name', 'email'],
    filterFields: ['role'],
    pageSize: 20
  });

  return (
    <ListContainer
      title="Gerenciar Usuários"
      subtitle="Gerentes e professores"
      headerAction={
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      }
      toolbar={
        <FilterBar
          searchTerm={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={addFilter}
          filterConfigs={[
            {
              key: 'role',
              label: 'Função',
              type: 'select',
              options: [
                { value: 'manager', label: 'Gerente' },
                { value: 'teacher', label: 'Professor' },
              ]
            }
          ]}
        />
      }
    >
      <DataTable
        data={data}
        columns={[
          { key: 'name', label: 'Nome', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'role', label: 'Função' },
        ]}
        onSort={toggleSort}
        sortField={sortField}
        sortDir={sortDir}
        actions={[
          { label: 'Editar', icon: Edit, onClick: () => {} },
          { label: 'Deletar', icon: Trash2, onClick: () => {}, variant: 'destructive' },
        ]}
      />

      <FormDialog
        title="Novo Usuário"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fields={[
          { name: 'name', label: 'Nome', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'role', label: 'Função', type: 'select', required: true,
            options: [{ value: 'manager', label: 'Gerente' }] },
        ]}
        onSubmit={(data) => {
          usersService.createUser(data);
          setIsDialogOpen(false);
        }}
      />
    </ListContainer>
  );
};
```

---

**Pronto! Use este guia para refatorar as páginas.**
