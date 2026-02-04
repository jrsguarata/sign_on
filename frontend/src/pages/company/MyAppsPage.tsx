import { useEffect, useState } from 'react';
import { AppWindow, ExternalLink } from 'lucide-react';
import { appsApi, Application } from '../../api/client';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function MyAppsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await appsApi.getAvailable();
      if (response.data.data) {
        setApplications(response.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar aplicacoes');
    } finally {
      setLoading(false);
    }
  };

  const accessApp = async (app: Application) => {
    try {
      const response = await appsApi.getAccessUrl(app.id);
      if (response.data.data) {
        const token = localStorage.getItem('accessToken');
        const url = new URL(response.data.data.url);
        url.searchParams.set('sso_token', token || '');
        window.open(url.toString(), '_blank');
      }
    } catch (error) {
      toast.error('Erro ao acessar aplicacao');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Aplicacoes</h1>
        <p className="text-gray-600">Acesse as aplicacoes contratadas pela sua empresa</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AppWindow size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Nenhuma aplicacao disponivel</h3>
          <p className="text-gray-500 mt-2">
            Sua empresa ainda nao possui aplicacoes contratadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                    <AppWindow size={28} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{app.name}</h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {app.description || 'Clique para acessar esta aplicacao'}
                </p>

                <Button onClick={() => accessApp(app)} className="w-full">
                  <ExternalLink size={18} />
                  Acessar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
