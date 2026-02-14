import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, AppWindow } from 'lucide-react';
import { companyApi, User, Application, ApplicationWithRole } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface UserForm {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [managingAppsUser, setManagingAppsUser] = useState<User | null>(null);
  const [companyApps, setCompanyApps] = useState<Application[]>([]);
  const [selectedApps, setSelectedApps] = useState<Map<string, string>>(new Map());
  const [loadingApps, setLoadingApps] = useState(false);
  const [savingApps, setSavingApps] = useState(false);

  const form = useForm<UserForm>();

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await companyApi.getUsers({ search, limit: 100 });
      if (response.data.data) {
        setUsers(response.data.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.reset({
        email: user.email,
        password: '',
        fullName: user.fullName,
        phone: user.phone || '',
      });
    } else {
      setEditingUser(null);
      form.reset({ email: '', password: '', fullName: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserForm) => {
    setSaving(true);
    try {
      if (editingUser) {
        const { password, ...updateData } = data;
        await companyApi.updateUser(editingUser.id, updateData);
        toast.success('Usuario atualizado com sucesso!');
      } else {
        await companyApi.createUser(data);
        toast.success('Usuario criado com sucesso!');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Erro ao salvar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuario?')) return;

    try {
      await companyApi.deleteUser(id);
      toast.success('Usuario desativado com sucesso!');
      loadUsers();
    } catch (error) {
      toast.error('Erro ao desativar usuario');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja reativar este usuario?')) return;

    try {
      await companyApi.reactivateUser(id);
      toast.success('Usuario reativado com sucesso!');
      loadUsers();
    } catch (error) {
      toast.error('Erro ao reativar usuario');
    }
  };

  const openManageApps = async (user: User) => {
    setManagingAppsUser(user);
    setLoadingApps(true);
    try {
      const [appsResponse, userAppsResponse] = await Promise.all([
        companyApi.getApplications(),
        companyApi.getUserApplications(user.id),
      ]);
      setCompanyApps(appsResponse.data.data || []);
      const userApps = (userAppsResponse.data.data || []) as ApplicationWithRole[];
      const appsMap = new Map<string, string>();
      userApps.forEach((a) => appsMap.set(a.id, a.appRole || 'COMPANY_OPERATOR'));
      setSelectedApps(appsMap);
    } catch (error) {
      toast.error('Erro ao carregar aplicacoes');
      setManagingAppsUser(null);
    } finally {
      setLoadingApps(false);
    }
  };

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) => {
      const next = new Map(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.set(appId, 'COMPANY_OPERATOR');
      }
      return next;
    });
  };

  const changeAppRole = (appId: string, role: string) => {
    setSelectedApps((prev) => {
      const next = new Map(prev);
      next.set(appId, role);
      return next;
    });
  };

  const saveUserApps = async () => {
    if (!managingAppsUser) return;
    setSavingApps(true);
    try {
      const applications = Array.from(selectedApps.entries()).map(([applicationId, role]) => ({
        applicationId,
        role,
      }));
      await companyApi.updateUserApplications(managingAppsUser.id, applications);
      toast.success('Aplicacoes atualizadas com sucesso!');
      setManagingAppsUser(null);
    } catch (error) {
      toast.error('Erro ao salvar aplicacoes');
    } finally {
      setSavingApps(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Usuario',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Perfil',
      render: (user: User) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {{ COMPANY_ADMIN: 'Administrador', COMPANY_COORDINATOR: 'Coordenador', COMPANY_SUPERVISOR: 'Supervisor', COMPANY_OPERATOR: 'Operador' }[user.role] || user.role}
        </span>
      ),
    },
    { key: 'phone', header: 'Telefone', render: (user: User) => user.phone || '-' },
    {
      key: 'active',
      header: 'Status',
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-40',
      render: (user: User) => (
        <div className="flex gap-1">
          <button
            onClick={() => setViewingUser(user)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Visualizar"
          >
            <Eye size={16} />
          </button>
          {user.role !== 'COMPANY_ADMIN' && (
            <>
              <button
                onClick={() => openManageApps(user)}
                className="p-2 hover:bg-primary-100 rounded text-primary-600"
                title="Aplicacoes"
              >
                <AppWindow size={16} />
              </button>
              <button onClick={() => openModal(user)} className="p-2 hover:bg-gray-100 rounded" title="Editar">
                <Edit size={16} />
              </button>
              {user.active ? (
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 hover:bg-red-100 rounded text-red-600"
                  title="Desativar"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleReactivate(user.id)}
                  className="p-2 hover:bg-green-100 rounded text-green-600"
                  title="Reativar"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-600">Gerencie os usuarios da sua empresa</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Novo Usuario
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <Table columns={columns} data={users} loading={loading} />

      {/* Modal de Edicao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Novo Usuario'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Completo"
            error={form.formState.errors.fullName?.message}
            {...form.register('fullName', { required: 'Nome e obrigatorio' })}
          />

          <Input
            label="Email"
            type="email"
            error={form.formState.errors.email?.message}
            {...form.register('email', { required: 'Email e obrigatorio' })}
          />

          {!editingUser && (
            <Input
              label="Senha"
              type="password"
              error={form.formState.errors.password?.message}
              {...form.register('password', {
                required: !editingUser ? 'Senha e obrigatoria' : false,
                minLength: { value: 8, message: 'Minimo 8 caracteres' },
              })}
            />
          )}

          <Input label="Telefone" {...form.register('phone')} />

          <p className="text-sm text-gray-500">
            O usuario sera criado como <strong>Operador</strong>. Apos a criacao, utilize o botao
            de <strong>Aplicacoes</strong> para definir quais aplicativos ele tera acesso.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualizacao */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Detalhes do Usuario"
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{viewingUser.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{viewingUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Perfil</p>
                <p className="font-medium">
                  {{ COMPANY_ADMIN: 'Administrador', COMPANY_COORDINATOR: 'Coordenador', COMPANY_SUPERVISOR: 'Supervisor', COMPANY_OPERATOR: 'Operador' }[viewingUser.role] || viewingUser.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{viewingUser.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    viewingUser.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {viewingUser.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ultimo Login</p>
                <p className="font-medium">{formatDate(viewingUser.lastLogin)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Informacoes de Auditoria</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p>{formatDate(viewingUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Criado por</p>
                  <p>{viewingUser.createdByName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado em</p>
                  <p>{formatDate(viewingUser.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado por</p>
                  <p>{viewingUser.updatedByName || '-'}</p>
                </div>
                {!viewingUser.active && (
                  <>
                    <div>
                      <p className="text-gray-500">Desativado em</p>
                      <p>{formatDate(viewingUser.deactivatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Desativado por</p>
                      <p>{viewingUser.deactivatedByName || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingUser(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Gerenciamento de Aplicacoes */}
      <Modal
        isOpen={!!managingAppsUser}
        onClose={() => setManagingAppsUser(null)}
        title={`Aplicacoes de ${managingAppsUser?.fullName || ''}`}
      >
        {managingAppsUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecione as aplicacoes e o perfil do usuario em cada uma:
            </p>

            {loadingApps ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : companyApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AppWindow size={32} className="mx-auto mb-2 text-gray-400" />
                <p>Nenhuma aplicacao contratada pela empresa.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {companyApps.map((app) => {
                  const isSelected = selectedApps.has(app.id);
                  return (
                    <div
                      key={app.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleApp(app.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <AppWindow size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{app.name}</p>
                        {app.description && (
                          <p className="text-xs text-gray-500 truncate">{app.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <select
                          value={selectedApps.get(app.id) || 'COMPANY_OPERATOR'}
                          onChange={(e) => changeAppRole(app.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="COMPANY_OPERATOR">Operador</option>
                          <option value="COMPANY_COORDINATOR">Coordenador</option>
                          <option value="COMPANY_SUPERVISOR">Supervisor</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-gray-500">
                {selectedApps.size} de {companyApps.length} selecionadas
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setManagingAppsUser(null)}>
                  Cancelar
                </Button>
                <Button onClick={saveUserApps} loading={savingApps}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
