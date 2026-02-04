import { useEffect, useState } from 'react';
import { Building2, Users, AppWindow, Mail, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminApi, appsApi, Application, ContactStats } from '../../api/client';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const statsRes = await adminApi.getContactStats();
        if (statsRes.data.data) setStats(statsRes.data.data);
      }

      const appsRes = await appsApi.getAvailable();
      if (appsRes.data.data) setApps(appsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const adminStats: StatCard[] = stats
    ? [
        { label: 'Leads Pendentes', value: stats.pending, icon: <Mail />, color: 'bg-yellow-500' },
        { label: 'Em Andamento', value: stats.contacted, icon: <Clock />, color: 'bg-blue-500' },
        { label: 'Convertidos', value: stats.converted, icon: <TrendingUp />, color: 'bg-green-500' },
        { label: 'Taxa de Conversao', value: `${stats.conversionRate}%`, icon: <TrendingUp />, color: 'bg-purple-500' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'SUPER_ADMIN'
            ? 'Visao geral do sistema'
            : user?.companyName
            ? `Bem-vindo ao painel da ${user.companyName}`
            : 'Bem-vindo ao seu painel'}
        </p>
      </div>

      {/* Stats (Admin only) */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access - Apps */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {user?.role === 'SUPER_ADMIN' ? 'Aplicacoes Disponiveis' : 'Suas Aplicacoes'}
        </h2>

        {apps.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nenhuma aplicacao disponivel no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  const token = localStorage.getItem('accessToken');
                  const url = new URL(app.url);
                  url.searchParams.set('sso_token', token || '');
                  window.open(url.toString(), '_blank');
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                    <AppWindow size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{app.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{app.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <QuickLink
              href="/dashboard/companies"
              icon={<Building2 />}
              title="Companhias"
              description="Gerenciar companhias cadastradas"
            />
            <QuickLink
              href="/dashboard/users"
              icon={<Users />}
              title="Usuarios"
              description="Gerenciar usuarios do sistema"
            />
            <QuickLink
              href="/dashboard/contacts"
              icon={<Mail />}
              title="Leads"
              description="Ver solicitacoes de contato"
            />
          </>
        )}

        {user?.role === 'COMPANY_ADMIN' && (
          <>
            <QuickLink
              href="/dashboard/team"
              icon={<Users />}
              title="Equipe"
              description="Gerenciar usuarios da empresa"
            />
            <QuickLink
              href="/dashboard/my-apps"
              icon={<AppWindow />}
              title="Aplicacoes"
              description="Ver aplicacoes contratadas"
            />
          </>
        )}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-start gap-4"
    >
      <div className="p-3 rounded-lg bg-gray-100 text-gray-600">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
}
