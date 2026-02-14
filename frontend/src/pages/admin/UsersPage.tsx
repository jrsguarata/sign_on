import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import { adminApi, User as UserType, Company } from '../../api/client';
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
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_COORDINATOR' | 'COMPANY_SUPERVISOR' | 'COMPANY_OPERATOR';
  companyId: string;
  phone: string;
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Admin Empresa',
  COMPANY_COORDINATOR: 'Coordenador',
  COMPANY_SUPERVISOR: 'Supervisor',
  COMPANY_OPERATOR: 'Operador',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<UserForm>();
  const watchRole = form.watch('role');

  useEffect(() => {
    loadData();
  }, [search, roleFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes] = await Promise.all([
        adminApi.getUsers({ search, role: roleFilter || undefined, limit: 100 }),
        adminApi.getCompanies({ active: true, limit: 100 }),
      ]);

      if (usersRes.data.data) setUsers(usersRes.data.data.data);
      if (companiesRes.data.data) setCompanies(companiesRes.data.data.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      form.reset({
        email: user.email,
        password: '',
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId || '',
        phone: user.phone || '',
      });
    } else {
      setEditingUser(null);
      form.reset({ email: '', password: '', fullName: '', role: 'COMPANY_OPERATOR', companyId: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        companyId: data.role === 'SUPER_ADMIN' ? undefined : data.companyId || undefined,
      };

      if (editingUser) {
        const { password, ...updateData } = payload;
        await adminApi.updateUser(editingUser.id, updateData);
        toast.success('Usuario atualizado com sucesso!');
      } else {
        await adminApi.createUser(payload as any);
        toast.success('Usuario criado com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuario?')) return;

    try {
      await adminApi.deleteUser(id);
      toast.success('Usuario desativado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao desativar usuario');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja reativar este usuario?')) return;

    try {
      await adminApi.reactivateUser(id);
      toast.success('Usuario reativado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao reativar usuario');
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Usuario',
      render: (user: UserType) => (
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
      render: (user: UserType) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {roleLabels[user.role] || user.role}
        </span>
      ),
    },
    { key: 'companyName', header: 'Empresa', render: (user: UserType) => user.companyName || '-' },
    {
      key: 'active',
      header: 'Status',
      render: (user: UserType) => (
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
      className: 'w-28',
      render: (user: UserType) => (
        <div className="flex gap-1">
          <button
            onClick={() => setViewingUser(user)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Visualizar"
          >
            <Eye size={16} />
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Novo Usuario
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os perfis</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COMPANY_ADMIN">Admin Empresa</option>
          <option value="COMPANY_COORDINATOR">Coordenador</option>
          <option value="COMPANY_SUPERVISOR">Supervisor</option>
          <option value="COMPANY_OPERATOR">Operador</option>
        </select>
      </div>

      <Table columns={columns} data={users} loading={loading} />

      {/* Modal de Edicao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Novo Usuario'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {!editingUser && (
            <Input
              label="Senha"
              type="password"
              error={form.formState.errors.password?.message}
              {...form.register('password', { required: !editingUser ? 'Senha e obrigatoria' : false })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...form.register('role', { required: true })}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="COMPANY_ADMIN">Admin Empresa</option>
                <option value="COMPANY_COORDINATOR">Coordenador</option>
                <option value="COMPANY_SUPERVISOR">Supervisor</option>
                <option value="COMPANY_OPERATOR">Operador</option>
              </select>
            </div>

            {watchRole !== 'SUPER_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...form.register('companyId', {
                    required: 'Empresa e obrigatoria',
                  })}
                >
                  <option value="">Selecione...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input label="Telefone" {...form.register('phone')} />

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
                <p className="font-medium">{roleLabels[viewingUser.role] || viewingUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{viewingUser.companyName || '-'}</p>
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
    </div>
  );
}
