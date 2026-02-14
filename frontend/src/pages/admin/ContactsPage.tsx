import { useEffect, useState } from 'react';
import { Search, Mail, Clock, Archive } from 'lucide-react';
import { adminApi, Contact, ContactStats } from '../../api/client';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-700',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsRes, statsRes] = await Promise.all([
        adminApi.getContacts({ search, status: statusFilter || undefined, limit: 100 }),
        adminApi.getContactStats(),
      ]);

      if (contactsRes.data.data) setContacts(contactsRes.data.data.data);
      if (statsRes.data.data) setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateContactStatus(id, status);
      toast.success('Status atualizado!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Contato',
      render: (contact: Contact) => (
        <div>
          <p className="font-medium">{contact.fullName}</p>
          <p className="text-sm text-gray-500">{contact.email}</p>
          {contact.companyName && <p className="text-xs text-gray-400">{contact.companyName}</p>}
        </div>
      ),
    },
    {
      key: 'interestedIn',
      header: 'Interesse',
      render: (contact: Contact) => contact.interestedIn || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (contact: Contact) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[contact.status]}`}>
          {contact.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (contact: Contact) => new Date(contact.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      header: '',
      render: (contact: Contact) => (
        <div className="flex gap-1">
          {contact.status === 'pending' && (
            <button
              onClick={() => updateStatus(contact.id, 'contacted')}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Marcar como contatado"
            >
              <Clock size={16} />
            </button>
          )}
          <button
            onClick={() => updateStatus(contact.id, 'archived')}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Arquivar"
          >
            <Archive size={16} />
          </button>
          <button
            onClick={() => setSelectedContact(contact)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Ver detalhes"
          >
            <Mail size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Leads e Contatos</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pendentes" value={stats.pending} color="yellow" />
          <StatCard label="Em Andamento" value={stats.contacted} color="blue" />
          <StatCard label="Arquivados" value={stats.archived} color="gray" />
          <StatCard label="Total" value={stats.total} color="purple" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="contacted">Em Andamento</option>
          <option value="archived">Arquivados</option>
        </select>
      </div>

      <Table columns={columns} data={contacts} loading={loading} />

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedContact(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Detalhes do Contato</h3>

              <div className="space-y-3">
                <p><strong>Nome:</strong> {selectedContact.fullName}</p>
                <p><strong>Email:</strong> {selectedContact.email}</p>
                <p><strong>Telefone:</strong> {selectedContact.phone || '-'}</p>
                <p><strong>Empresa:</strong> {selectedContact.companyName || '-'}</p>
                <p><strong>Interesse:</strong> {selectedContact.interestedIn || '-'}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[selectedContact.status]}`}>
                    {selectedContact.status}
                  </span>
                </p>
                <div>
                  <strong>Mensagem:</strong>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedContact.message}</p>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações de Auditoria</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Criado em</p>
                    <p>{new Date(selectedContact.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Atualizado em</p>
                    <p>{selectedContact.updatedAt ? new Date(selectedContact.updatedAt).toLocaleString('pt-BR') : '-'}</p>
                  </div>
                  {selectedContact.updatedByName && (
                    <div>
                      <p className="text-gray-500">Atualizado por</p>
                      <p>{selectedContact.updatedByName}</p>
                    </div>
                  )}
                  {selectedContact.contactedAt && (
                    <div>
                      <p className="text-gray-500">Contatado em</p>
                      <p>{new Date(selectedContact.contactedAt).toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                  {selectedContact.assignedUser && (
                    <div>
                      <p className="text-gray-500">Atribuido a</p>
                      <p>{selectedContact.assignedUser.fullName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedContact(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    gray: 'bg-gray-50 border-gray-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
