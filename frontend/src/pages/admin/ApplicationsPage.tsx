import { useEffect, useState } from 'react';
import { Plus, AppWindow, Edit, Trash2, Key, Eye, RotateCcw } from 'lucide-react';
import { adminApi, Application } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
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
      toast.error('Erro ao carregar aplicacoes');
    } finally {
      setLoading(false);
    }
  };

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
        toast.success('Aplicacao atualizada com sucesso!');
      } else {
        await adminApi.createApplication(data);
        toast.success('Aplicacao criada com sucesso!');
      }
      setIsModalOpen(false);
      loadApplications();
    } catch (error) {
      toast.error('Erro ao salvar aplicacao');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta aplicacao?')) return;

    try {
      await adminApi.deleteApplication(id);
      toast.success('Aplicacao desativada com sucesso!');
      loadApplications();
    } catch (error) {
      toast.error('Erro ao desativar aplicacao');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja reativar esta aplicacao?')) return;

    try {
      await adminApi.reactivateApplication(id);
      toast.success('Aplicacao reativada com sucesso!');
      loadApplications();
    } catch (error) {
      toast.error('Erro ao reativar aplicacao');
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copiada!');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Aplicacoes</h1>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Nova Aplicacao
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <AppWindow size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{app.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      app.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {app.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
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
            </div>

            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {app.description || 'Sem descricao'}
            </p>

            <div className="mt-4 text-sm">
              <p className="text-gray-500">URL:</p>
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline break-all"
              >
                {app.url}
              </a>
            </div>

            {app.apiKey && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">API Key:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
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
              </div>
            )}
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhuma aplicacao cadastrada.
        </div>
      )}

      {/* Modal de Edicao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Editar Aplicacao' : 'Nova Aplicacao'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Nome e obrigatorio' })}
          />
          <Input label="Descricao" {...form.register('description')} />
          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            error={form.formState.errors.url?.message}
            {...form.register('url', { required: 'URL e obrigatoria' })}
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

      {/* Modal de Visualizacao */}
      <Modal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="Detalhes da Aplicacao"
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
                <p className="text-sm text-gray-500">Descricao</p>
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
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Informacoes de Auditoria</h4>
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
