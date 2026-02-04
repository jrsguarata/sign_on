import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  AppWindow,
  Mail,
  User,
  Grid3X3,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: ('SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_OPERATOR')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    href: '/dashboard',
  },
  {
    label: 'Companhias',
    icon: <Building2 size={20} />,
    href: '/dashboard/companies',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Aplicacoes',
    icon: <AppWindow size={20} />,
    href: '/dashboard/applications',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Usuarios',
    icon: <Users size={20} />,
    href: '/dashboard/users',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Leads',
    icon: <Mail size={20} />,
    href: '/dashboard/contacts',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Minhas Aplicacoes',
    icon: <Grid3X3 size={20} />,
    href: '/dashboard/my-apps',
    roles: ['COMPANY_ADMIN', 'COMPANY_OPERATOR'],
  },
  {
    label: 'Equipe',
    icon: <Users size={20} />,
    href: '/dashboard/team',
    roles: ['COMPANY_ADMIN'],
  },
  {
    label: 'Meu Perfil',
    icon: <User size={20} />,
    href: '/dashboard/profile',
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/dashboard" className="font-bold text-2xl text-primary-600">
              SignOn
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.companyName || 'Administrador'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
