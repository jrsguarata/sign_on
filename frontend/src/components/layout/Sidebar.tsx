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
import logo from '../../images/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: ('SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_SUPERVISOR' | 'COMPANY_OPERATOR')[];
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
    label: 'Aplicações',
    icon: <AppWindow size={20} />,
    href: '/dashboard/applications',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Usuários',
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
    label: 'Minhas Aplicações',
    icon: <Grid3X3 size={20} />,
    href: '/dashboard/my-apps',
    roles: ['COMPANY_ADMIN', 'COMPANY_SUPERVISOR', 'COMPANY_OPERATOR'],
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6">
            <Link to="/dashboard" className="flex flex-col items-center">
              <img src={logo} alt="FoX IoT" className="h-7" />
              <span className="text-[10px] font-semibold text-gray-400 mt-0.5">Plataforma SaaS</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 lg:hidden text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FF8C00]/20 to-[#FF5E00]/20 border-l-4 border-[#FF8C00] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-40'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>



        </div>
      </aside>
    </>
  );
}
