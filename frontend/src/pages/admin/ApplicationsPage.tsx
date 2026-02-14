import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, AppWindow, Edit, Trash2, Key, Eye, RotateCcw } from 'lucide-react';
import { adminApi, Application } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AppForm {
  name: string;
  description: string;
  url: string;
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<AppForm>();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getApplications();
      if (response.data.data) {
        setApplications(response.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar aplicações');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    if (!search.trim()) return applications;
    const term = search.toLowerCase();
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(term) ||
        (app.description && app.description.toLowerCase().includes(term)) ||
        app.url.toLowerCase().includes(term)
    );
  }, [applications, search]);

  const openModal = (app?: Application) => {
    if (app) {
      setEditingApp(app);
      form.reset({
        name: app.name,
        description: app.description || '',
        url: app.url,
      });
    } else {
      setEditingApp(null);
      form.reset({ name: '', description: '', url: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AppForm) => {
    setSaving(true);
    try {
      if (editingApp) {
        await adminApi.updateApplication(editingApp.id, data);
        toast.success('Aplicação atualizada com sucesso!');
      } else {
        await adminApi.createApplication(data);
        toast.success('Aplicação criada com sucesso!');
      }
      setIsModalOpen(false);
      loadApplications();
    } catch (error) {
      toast.error('Erro ao salvar aplicação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta aplicação?')) return;

    try {
      await adminApi.deleteApplication(id);
      toast.success('Aplicação desativada com sucesso!');
      loadApplications();
    } catch (error) {
      toast.error('Erro ao desativar aplicação');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja reativar esta aplicação?')) return;

    try {
      await adminApi.reactivateApplication(id);
      toast.success('Aplicação reativada com sucesso!');
      loadApplications();
    } catch (error) {
      toast.error('Erro ao reativar aplicação');
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copiada!');
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (app: Application) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <AppWindow size={20} />
          </div>
          <div>
            <p className="font-medium">{app.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{app.description || 'Sem descrição'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'url',
      header: 'URL',
      render: (app: Application) => (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline break-all text-sm"
        >
          {app.url}
        </a>
      ),
    },
    {
      key: 'apiKey',
      header: 'API Key',
      render: (app: Application) =>
        app.apiKey ? (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[180px]">
              {app.apiKey}
            </code>
            <button
              onClick={() => copyApiKey(app.apiKey!)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Copiar"
            >
              <Key size={14} />
            </button>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (app: Application) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            app.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {app.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (app: Application) => (
        <div className="flex gap-1">
          <button
            onClick={() => setViewingApp(app)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Visualizar"
          >
            <Eye size={16} />
          </button>
          <button onClick={() => openModal(app)} className="p-2 hover:bg-gray-100 rounded" title="Editar">
            <Edit size={16} />
          </button>
          {app.active ? (
            <button
              onClick={() => handleDelete(app.id)}
              className="p-2 hover:bg-red-100 rounded text-red-600"
              title="Desativar"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleReactivate(app.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Aplicações</h1>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Nova Aplicação
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar aplicações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <Table columns={columns} data={filteredApplications} loading={loading} emptyMessage="Nenhuma aplicação cadastrada." />

      {/* Modal de Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Editar Aplicação' : 'Nova Aplicação'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Nome é obrigatório' })}
          />
          <Input label="Descrição" {...form.register('description')} />
          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            error={form.formState.errors.url?.message}
            {...form.register('url', { required: 'URL é obrigatória' })}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingApp ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="Detalhes da Aplicação"
        size="lg"
      >
        {viewingApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{viewingApp.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    viewingApp.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {viewingApp.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium">{viewingApp.description || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">URL</p>
                <a
                  href={viewingApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {viewingApp.url}
                </a>
              </div>
              {viewingApp.apiKey && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">API Key</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                    {viewingApp.apiKey}
                  </code>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações de Auditoria</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p>{formatDate(viewingApp.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Criado por</p>
                  <p>{viewingApp.createdByName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado em</p>
                  <p>{formatDate(viewingApp.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado por</p>
                  <p>{viewingApp.updatedByName || '-'}</p>
                </div>
                {!viewingApp.active && (
                  <>
                    <div>
                      <p className="text-gray-500">Desativado em</p>
                      <p>{formatDate(viewingApp.deactivatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Desativado por</p>
                      <p>{viewingApp.deactivatedByName || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingApp(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
