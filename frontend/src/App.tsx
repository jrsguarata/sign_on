import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin Pages
import CompaniesPage from './pages/admin/CompaniesPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import UsersPage from './pages/admin/UsersPage';
import ContactsPage from './pages/admin/ContactsPage';

// Company Pages
import MyAppsPage from './pages/company/MyAppsPage';
import TeamPage from './pages/company/TeamPage';

// Components
import PrivateRoute from './routes/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas Publicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas Protegidas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Rotas Admin */}
        <Route path="companies" element={<PrivateRoute allowedRoles={['SUPER_ADMIN']}><CompaniesPage /></PrivateRoute>} />
        <Route path="applications" element={<PrivateRoute allowedRoles={['SUPER_ADMIN']}><ApplicationsPage /></PrivateRoute>} />
        <Route path="users" element={<PrivateRoute allowedRoles={['SUPER_ADMIN']}><UsersPage /></PrivateRoute>} />
        <Route path="contacts" element={<PrivateRoute allowedRoles={['SUPER_ADMIN']}><ContactsPage /></PrivateRoute>} />

        {/* Rotas Company */}
        <Route path="my-apps" element={<PrivateRoute allowedRoles={['COMPANY_ADMIN', 'COMPANY_SUPERVISOR', 'COMPANY_OPERATOR']}><MyAppsPage /></PrivateRoute>} />
        <Route path="team" element={<PrivateRoute allowedRoles={['COMPANY_ADMIN']}><TeamPage /></PrivateRoute>} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-400">404</h1>
              <p className="mt-4 text-xl text-gray-600">Pagina nao encontrada</p>
              <a
                href="/"
                className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Voltar ao inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
