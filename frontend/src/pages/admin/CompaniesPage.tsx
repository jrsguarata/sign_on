import { useEffect, useState } from 'react';
import { Plus, Search, Building2, Trash2, Edit, Eye, RotateCcw, AppWindow, X } from 'lucide-react';
import { adminApi, Company, Application, CompanyApplication } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface CompanyForm {
  name: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [appsModalCompany, setAppsModalCompany] = useState<Company | null>(null);
  const [linkedApps, setLinkedApps] = useState<CompanyApplication[]>([]);
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const form = useForm<CompanyForm>();

  useEffect(() => {
    loadCompanies();
  }, [search]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCompanies({ search, limit: 100 });
      if (response.data.data) {
        setCompanies(response.data.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar companhias');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      form.reset({
        name: company.name,
        cnpj: company.cnpj || '',
        contact: company.contact || '',
        email: company.email || '',
        phone: company.phone || '',
      });
    } else {
      setEditingCompany(null);
      form.reset({ name: '', cnpj: '', contact: '', email: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CompanyForm) => {
    setSaving(true);
    try {
      if (editingCompany) {
        await adminApi.updateCompany(editingCompany.id, data);
        toast.success('Companhia atualizada com sucesso!');
      } else {
        await adminApi.createCompany(data);
        toast.success('Companhia criada com sucesso!');
      }
      setIsModalOpen(false);
      loadCompanies();
    } catch (error) {
      toast.error('Erro ao salvar companhia');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta companhia?')) return;

    try {
      await adminApi.deleteCompany(id);
      toast.success('Companhia desativada com sucesso!');
      loadCompanies();
    } catch (error) {
      toast.error('Erro ao desativar companhia');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja reativar esta companhia?')) return;

    try {
      await adminApi.reactivateCompany(id);
      toast.success('Companhia reativada com sucesso!');
      loadCompanies();
    } catch (error) {
      toast.error('Erro ao reativar companhia');
    }
  };

  const openAppsModal = async (company: Company) => {
    setAppsModalCompany(company);
    setLoadingApps(true);
    try {
      const [appsRes, allAppsRes] = await Promise.all([
        adminApi.getCompanyApplications(company.id),
        adminApi.getApplications(),
      ]);
      if (appsRes.data.data) setLinkedApps(appsRes.data.data);
      if (allAppsRes.data.data) setAllApps(allAppsRes.data.data.filter((a: Application) => a.active));
    } catch (error) {
      toast.error('Erro ao carregar aplicacoes');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleLinkApp = async (applicationId: string) => {
    if (!appsModalCompany) return;
    try {
      await adminApi.linkApplication(appsModalCompany.id, applicationId);
      toast.success('Aplicacao vinculada com sucesso!');
      const res = await adminApi.getCompanyApplications(appsModalCompany.id);
      if (res.data.data) setLinkedApps(res.data.data);
    } catch (error) {
      toast.error('Erro ao vincular aplicacao');
    }
  };

  const handleUnlinkApp = async (applicationId: string) => {
    if (!appsModalCompany) return;
    try {
      await adminApi.unlinkApplication(appsModalCompany.id, applicationId);
      toast.success('Aplicacao desvinculada com sucesso!');
      const res = await adminApi.getCompanyApplications(appsModalCompany.id);
      if (res.data.data) setLinkedApps(res.data.data);
    } catch (error) {
      toast.error('Erro ao desvincular aplicacao');
    }
  };

  const linkedAppIds = new Set(linkedApps.map((la) => la.applicationId));
  const availableApps = allApps.filter((app) => !linkedAppIds.has(app.id));

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (company: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <Building2 size={20} />
          </div>
          <div>
            <p className="font-medium">{company.name}</p>
            <p className="text-sm text-gray-500">{company.cnpj || 'Sem CNPJ'}</p>
          </div>
        </div>
      ),
    },
    { key: 'contact', header: 'Contato', render: (company: Company) => company.contact || '-' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefone' },
    {
      key: 'active',
      header: 'Status',
      render: (company: Company) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            company.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {company.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-40',
      render: (company: Company) => (
        <div className="flex gap-1">
          <button
            onClick={() => setViewingCompany(company)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Visualizar"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openAppsModal(company)}
            className="p-2 hover:bg-purple-100 rounded text-purple-600"
            title="Aplicacoes Licenciadas"
          >
            <AppWindow size={16} />
          </button>
          <button
            onClick={() => openModal(company)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          {company.active ? (
            <button
              onClick={() => handleDelete(company.id)}
              className="p-2 hover:bg-red-100 rounded text-red-600"
              title="Desativar"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleReactivate(company.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Companhias</h1>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Nova Companhia
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar companhias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <Table columns={columns} data={companies} loading={loading} />

      {/* Modal de Edicao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Editar Companhia' : 'Nova Companhia'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome *"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Nome e obrigatorio' })}
          />
          <Input
            label="CNPJ *"
            placeholder="00.000.000/0000-00"
            error={form.formState.errors.cnpj?.message}
            {...form.register('cnpj', { required: 'CNPJ e obrigatorio' })}
          />
          <Input
            label="Contato *"
            error={form.formState.errors.contact?.message}
            {...form.register('contact', { required: 'Contato e obrigatorio' })}
          />
          <Input
            label="Email *"
            type="email"
            error={form.formState.errors.email?.message}
            {...form.register('email', { required: 'Email e obrigatorio' })}
          />
          <Input
            label="Telefone *"
            error={form.formState.errors.phone?.message}
            {...form.register('phone', { required: 'Telefone e obrigatorio' })}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingCompany ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualizacao */}
      <Modal
        isOpen={!!viewingCompany}
        onClose={() => setViewingCompany(null)}
        title="Detalhes da Companhia"
        size="lg"
      >
        {viewingCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{viewingCompany.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CNPJ</p>
                <p className="font-medium">{viewingCompany.cnpj || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contato</p>
                <p className="font-medium">{viewingCompany.contact || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{viewingCompany.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{viewingCompany.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    viewingCompany.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {viewingCompany.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Informacoes de Auditoria</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p>{formatDate(viewingCompany.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Criado por</p>
                  <p>{viewingCompany.createdByName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado em</p>
                  <p>{formatDate(viewingCompany.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Atualizado por</p>
                  <p>{viewingCompany.updatedByName || '-'}</p>
                </div>
                {!viewingCompany.active && (
                  <>
                    <div>
                      <p className="text-gray-500">Desativado em</p>
                      <p>{formatDate(viewingCompany.deactivatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Desativado por</p>
                      <p>{viewingCompany.deactivatedByName || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingCompany(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Aplicacoes Licenciadas */}
      <Modal
        isOpen={!!appsModalCompany}
        onClose={() => setAppsModalCompany(null)}
        title={`Aplicacoes Licenciadas - ${appsModalCompany?.name || ''}`}
        size="lg"
      >
        {appsModalCompany && (
          <div className="space-y-6">
            {loadingApps ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Aplicacoes vinculadas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Aplicacoes Vinculadas ({linkedApps.length})
                  </h4>
                  {linkedApps.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">Nenhuma aplicacao vinculada.</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedApps.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600">
                              <AppWindow size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{link.application.name}</p>
                              <p className="text-xs text-gray-500">{link.application.url}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkApp(link.applicationId)}
                            className="p-1.5 hover:bg-red-100 rounded text-red-500"
                            title="Desvincular"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aplicacoes disponiveis para vincular */}
                {availableApps.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Aplicacoes Disponiveis ({availableApps.length})
                    </h4>
                    <div className="space-y-2">
                      {availableApps.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                              <AppWindow size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{app.name}</p>
                              <p className="text-xs text-gray-500">{app.url}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLinkApp(app.id)}
                            className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                          >
                            Vincular
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setAppsModalCompany(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
