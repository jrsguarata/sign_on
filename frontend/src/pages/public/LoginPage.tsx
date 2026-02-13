import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Redirecionar se ja estiver logado
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const success = await login(data.email, data.password);
    setLoading(false);

    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left - Branding */}
      <div className="relative bg-gradient-to-br from-[#FF8C00] to-[#FF5E00] items-center justify-center p-12 hidden md:flex">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-5xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SignOn</h1>
          <p className="text-white/90 text-lg">Sistema de Autenticacao Centralizada</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#FF5E00] rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SignOn</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
          <p className="text-gray-600 mb-8">Entre com suas credenciais</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FF8C00] focus:border-[#FF8C00]'
                }`}
                {...register('email', {
                  required: 'Email e obrigatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalido',
                  },
                })}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FF8C00] focus:border-[#FF8C00]'
                  }`}
                  {...register('password', {
                    required: 'Senha e obrigatoria',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#FF8C00] rounded focus:ring-[#FF8C00]" />
                <span className="text-sm text-gray-700">Lembrar de mim</span>
              </label>
              <button type="button" className="text-[#FF8C00] hover:text-[#E65100] font-medium text-sm transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] text-white py-3 px-6 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nao tem uma conta?{' '}
              <Link to="/#contato" className="text-[#FF8C00] hover:text-[#E65100] font-medium transition-colors">
                Entre em contato
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
