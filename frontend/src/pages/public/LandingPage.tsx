import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Menu,
  X,
  Shield,
  Cloud,
  Headphones,
  Puzzle,
  ChevronDown,
  ChevronUp,
  Check,
  Send,
} from 'lucide-react';
import { publicApi, Product, Faq, ContactFormData } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, faqsRes] = await Promise.all([
        publicApi.getProducts(),
        publicApi.getFaq(),
      ]);

      if (productsRes.data.data) setProducts(productsRes.data.data);
      if (faqsRes.data.data) setFaqs(faqsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmitContact = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await publicApi.submitContact(data);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      reset();
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Shield size={40} />, title: 'Seguranca', desc: 'Dados criptografados e backup automatico' },
    { icon: <Cloud size={40} />, title: '100% Cloud', desc: 'Acesse de qualquer lugar' },
    { icon: <Headphones size={40} />, title: 'Suporte 24/7', desc: 'Equipe sempre disponivel' },
    { icon: <Puzzle size={40} />, title: 'Integracoes', desc: 'Conecte com suas ferramentas' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-2xl text-primary-600">
            SignOn
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8">
            <li><a href="#produtos" className="text-gray-600 hover:text-primary-600">Produtos</a></li>
            <li><a href="#diferenciais" className="text-gray-600 hover:text-primary-600">Diferenciais</a></li>
            <li><a href="#faq" className="text-gray-600 hover:text-primary-600">FAQ</a></li>
            <li><a href="#contato" className="text-gray-600 hover:text-primary-600">Contato</a></li>
          </ul>

          <div className="hidden md:block">
            <Link to="/login">
              <Button>Entrar</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <ul className="p-4 space-y-4">
              <li><a href="#produtos" onClick={() => setIsMenuOpen(false)}>Produtos</a></li>
              <li><a href="#diferenciais" onClick={() => setIsMenuOpen(false)}>Diferenciais</a></li>
              <li><a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a></li>
              <li><a href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</a></li>
              <li>
                <Link to="/login">
                  <Button className="w-full">Entrar</Button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforme a gestao do seu negocio
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gerenciar todas as areas da sua empresa em um so lugar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contato">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Solicitar Demo
              </Button>
            </a>
            <a href="#produtos">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Conhecer Produtos
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section id="produtos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nossos Planos
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl p-8 shadow-lg ${
                  product.isFeatured ? 'ring-2 ring-primary-600 scale-105' : ''
                }`}
              >
                {product.isFeatured && (
                  <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mt-4">{product.name}</h3>
                <p className="text-gray-600 mt-2">{product.shortDescription}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    R$ {Number(product.priceMonthly)?.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-500">/mes</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {product.features?.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contato" className="block mt-8">
                  <Button
                    className="w-full"
                    variant={product.isFeatured ? 'primary' : 'outline'}
                  >
                    Comecar Agora
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher nossa plataforma?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openFaq === faq.id && (
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Entre em contato
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Preencha o formulario abaixo e entraremos em contato em breve
          </p>

          <form onSubmit={handleSubmit(onSubmitContact)} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                placeholder="Seu nome"
                error={errors.fullName?.message}
                {...register('fullName', { required: 'Nome e obrigatorio' })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email e obrigatorio',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalido' },
                })}
              />
              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                {...register('phone')}
              />
              <Input
                label="Empresa"
                placeholder="Nome da empresa"
                {...register('companyName')}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenho interesse em:
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('interestedIn')}
              >
                <option value="demo">Solicitar demonstracao</option>
                <option value="trial">Periodo de teste</option>
                <option value="pricing">Informacoes sobre precos</option>
                <option value="partnership">Parceria comercial</option>
                <option value="other">Outros assuntos</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem *
              </label>
              <textarea
                rows={4}
                placeholder="Como podemos ajudar?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('message', { required: 'Mensagem e obrigatoria' })}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full mt-6" size="lg">
              <Send size={20} />
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">SignOn</h3>
              <p className="text-gray-400">
                Plataforma completa para gerenciar todas as areas da sua empresa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#produtos" className="hover:text-white">Produtos</a></li>
                <li><a href="#diferenciais" className="hover:text-white">Diferenciais</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contato" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Documentacao</a></li>
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 SignOn. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
