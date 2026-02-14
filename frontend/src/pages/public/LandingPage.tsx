import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  Database,
  TrendingUp,
  Cpu,
  Activity,
  Server,
  Zap,
  Layers,
  Settings,
  Send,
  Plug,
  Brain,
  Camera,
  Satellite,
  ArrowRight,
  Search,
  Network,
} from 'lucide-react';
import logo from '../../images/logo.png';
import imgTecnova from '../../images/parceria/tecnova.jpg';
import imgFapergs from '../../images/parceria/fapergs.png';
import imgFinerp from '../../images/parceria/finerp.png';
import imgVentur from '../../images/parceria/ventur.png';
import imgShell from '../../images/parceria/shell.png';
import imgNovus from '../../images/parceria/novus.jpg';
import imgInesc from '../../images/parceria/inesc.jpg';
import imgUfsm from '../../images/parceria/ufsm.jpg';
import imgParque from '../../images/parceria/parque.png';
import imgPpge from '../../images/parceria/ppge.png';
import imgParana from '../../images/parceria/parana.png';
import imgAneel from '../../images/parceria/aneel.jpg';
import imgCpfl from '../../images/carrossel/cpfl.png';
import imgEdp from '../../images/carrossel/edp.jpg';
import imgCelesc from '../../images/carrossel/celesc.png';
import imgMux from '../../images/carrossel/mux.png';
import imgEletrobras from '../../images/carrossel/eletrobras.png';
import imgCeee from '../../images/carrossel/ceee.png';
import imgNovusC from '../../images/carrossel/novus.jpg';
import imgCertanorte from '../../images/carrossel/certanorte.png';
import imgCermissoes from '../../images/carrossel/cermissoes.png';
import imgCopel from '../../images/carrossel/copel.png';
import { publicApi, ContactFormData } from '../../api/client';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [clientesIndex, setClientesIndex] = useState(0);
  const { clearSession } = useAuth();
  const navigate = useNavigate();

  // Limpar sessao ao carregar a landing page (exigir novo login a cada visita)
  useEffect(() => {
    clearSession();
    sessionStorage.removeItem('canLogin');
  }, [clearSession]);

  const handleLoginClick = () => {
    sessionStorage.setItem('canLogin', 'true');
    navigate('/login');
  };

  const parceriasImgs = [
    { src: imgFapergs, alt: 'FAPERGS' },
    { src: imgTecnova, alt: 'Tecnova' },
    { src: imgShell, alt: 'Shell' },
    { src: imgVentur, alt: 'Ventiur Smart Capital' },
    { src: imgUfsm, alt: 'UFSM' },
    { src: imgInesc, alt: 'INESC P&D Brasil' },
    { src: imgNovus, alt: 'Novus' },
    { src: imgParque, alt: 'Parque Tecnológico' },
    { src: imgPpge, alt: 'PPGE' },
    { src: imgFinerp, alt: 'FINERP' },
    { src: imgParana, alt: 'Paraná' },
    { src: imgAneel, alt: 'ANEEL' },
  ];
  const carouselTotal = Math.ceil(parceriasImgs.length / 4);

  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === carouselTotal - 1 ? 0 : prev + 1));
  }, [carouselTotal]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const clientesImgs = [
    { src: imgCpfl, alt: 'CPFL' },
    { src: imgEdp, alt: 'EDP' },
    { src: imgCelesc, alt: 'Celesc' },
    { src: imgMux, alt: 'MUX' },
    { src: imgEletrobras, alt: 'Eletrobras' },
    { src: imgCeee, alt: 'CEEE' },
    { src: imgNovusC, alt: 'Novus' },
    { src: imgCertanorte, alt: 'Certanorte' },
    { src: imgCermissoes, alt: 'Cermissões' },
    { src: imgCopel, alt: 'Copel' },
  ];
  const clientesTotal = Math.ceil(clientesImgs.length / 4);

  const nextClienteSlide = useCallback(() => {
    setClientesIndex((prev) => (prev === clientesTotal - 1 ? 0 : prev + 1));
  }, [clientesTotal]);

  useEffect(() => {
    const timer = setInterval(nextClienteSlide, 5000);
    return () => clearInterval(timer);
  }, [nextClienteSlide]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmitContact = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await publicApi.submitContact(data);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao enviar mensagem. Tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const pilares = [
    { num: '01', icon: <Database size={28} />, title: 'Integração de Dados', desc: 'Consolidar dados de medidores inteligentes, sistemas de supervisão de rede, bases comerciais e fontes externas em pipelines integrados e abrangentes.' },
    { num: '02', icon: <TrendingUp size={28} />, title: 'Análise Avançada', desc: 'Processamento e análise avançada de dados de energia utilizando técnicas estatísticas, machine learning e engenharia de features específicas do domínio elétrico.' },
    { num: '03', icon: <Cpu size={28} />, title: 'Algoritmos de IA', desc: 'Desenvolvimento e implementação de modelos de inteligência artificial personalizados para detecção de anomalias, previsão de demanda, identificação de perdas e otimização de ativos.' },
    { num: '04', icon: <Activity size={28} />, title: 'Monitoramento de Ativos', desc: 'Avaliação contínua da condição e do desempenho de transformadores, alimentadores e demais equipamentos críticos da infraestrutura elétrica.' },
    { num: '05', icon: <Server size={28} />, title: 'Plataformas Escaláveis', desc: 'Arquiteturas cloud-native orientadas por APIs, que possibilitam integração transparente com sistemas legados e expansão dinâmica conforme as necessidades operacionais.' },
  ];




  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="font-bold text-xl text-white">FoX IoT</span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li><a href="#quem-somos" className="text-gray-300 hover:text-white transition-colors">Quem Somos</a></li>
            <li><a href="#jornada-distribuicao" className="text-gray-300 hover:text-white transition-colors">Jornada de Distribuição</a></li>
            <li><a href="#otimizacao-manutencao" className="text-gray-300 hover:text-white transition-colors">Manutenção</a></li>
            <li><a href="#o-que-fazemos" className="text-gray-300 hover:text-white transition-colors">O Que Fazemos</a></li>
            <li><a href="#parcerias" className="text-gray-300 hover:text-white transition-colors">Parcerias</a></li>
            <li><a href="#clientes" className="text-gray-300 hover:text-white transition-colors">Clientes</a></li>
            <li><a href="#contato" className="text-gray-300 hover:text-white transition-colors">Contato</a></li>
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleLoginClick}
              className="px-5 py-2 rounded-full text-sm font-medium text-white border border-gray-600 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all"
            >
              Entrar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <ul className="p-4 space-y-3">
              <li><a href="#quem-somos" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Quem Somos</a></li>
              <li><a href="#jornada-distribuicao" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Jornada de Distribuição</a></li>
              <li><a href="#otimizacao-manutencao" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Manutenção</a></li>
              <li><a href="#o-que-fazemos" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">O Que Fazemos</a></li>
              <li><a href="#parcerias" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Parcerias</a></li>
              <li><a href="#clientes" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Clientes</a></li>
              <li><a href="#contato" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Contato</a></li>
              <li>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}
                  className="w-full mt-2 px-5 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] text-white"
                >
                  Entrar
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* SECAO 1 - Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF8C00] rounded-full blur-[128px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FF5E00] rounded-full blur-[128px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <img src={logo} alt="FoX IoT" className="h-20 mx-auto mb-8" />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] bg-clip-text text-transparent">Plataforma SaaS</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            A jornada para a evolução da gestão da rede de distribuição — do cadastro passivo até um gêmeo digital operacional — e a otimização da manutenção preventiva de torres de transmissão em uma única plataforma.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <a href="#jornada-distribuicao" className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF8C00]/50 hover:bg-white/10 transition-all">
              <Layers size={18} className="text-[#FF8C00] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Jornada de Distribuição</span>
            </a>
            <a href="#otimizacao-manutencao" className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF8C00]/50 hover:bg-white/10 transition-all">
              <Settings size={18} className="text-[#FF8C00] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Otimização de Manutenção</span>
            </a>
            <a href="#o-que-fazemos" className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF8C00]/50 hover:bg-white/10 transition-all">
              <Zap size={18} className="text-[#FF8C00] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Conheça nossos Serviços</span>
            </a>
            <a href="#contato" className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] text-white font-medium text-sm hover:shadow-lg hover:shadow-orange-500/40 transition-all">
              <Send size={18} />
              Fale com um Especialista
            </a>
          </div>
        </div>
      </section>

      {/* SECAO 2 - Quem somos */}
      <section id="quem-somos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Transformamos dados em inteligência e inteligência em decisões que movem a rede
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                A FoX IoT é uma empresa brasileira de base tecnológica especializada em inteligência
                de dados, inteligência artificial, Internet das Coisas e algoritmos avançados de
                análise aplicados ao setor elétrico.
              </p>
              <p>
                Nossa atuação é focada em medição inteligente, análise de dados energéticos,
                monitoramento de ativos elétricos e otimização de eficiência operacional.
              </p>
              <p>
                Construímos nossa credibilidade sobre uma base sólida de conhecimento em engenharia
                elétrica, sistemas de medição, telecomunicações e desenvolvimento de software de
                alta performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECAO - Jornada de Distribuição */}
      <section id="jornada-distribuicao" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Jornada para Evolução da Gestão da Rede de Distribuição
          </h2>
          <p className="text-gray-600 text-lg text-center mb-16 max-w-3xl mx-auto">
            Do cadastro passivo até um gêmeo digital operacional
          </p>

          {/* Timeline / Jornada */}
          <div className="relative">
            {/* Linha conectora - desktop */}
            <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#FF8C00]/20 via-[#FF8C00] to-[#FF8C00]/20 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10 items-stretch">
              {[
                {
                  num: 1,
                  name: 'Prometeu',
                  icon: <Search size={28} />,
                  desc: 'Descubra as características de sua rede',
                  color: 'from-orange-500 to-amber-500',
                },
                {
                  num: 2,
                  name: 'Hefesto',
                  icon: <Satellite size={28} />,
                  desc: 'Complemente seu cadastro de unidades consumidoras e detecte fraudes por ligação clandestina',
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  num: 3,
                  name: 'Spinon',
                  icon: <Plug size={28} />,
                  desc: 'Conecte sua rede às medições realizadas ao longo dela',
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  num: 4,
                  name: 'Apollo',
                  icon: <Brain size={28} />,
                  desc: 'Conheça o comportamento das cargas distribuídas pela rede de distribuição',
                  color: 'from-purple-500 to-violet-500',
                },
                {
                  num: 5,
                  name: 'Urania',
                  icon: <Network size={28} />,
                  desc: 'Obtenha a distribuição das grandezas elétricas ao longo da rede',
                  color: 'from-rose-500 to-pink-500',
                },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex flex-col items-center h-full">
                  {/* Número + ícone */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                    {step.icon}
                  </div>

                  {/* Seta entre cards - mobile/tablet */}
                  {i < arr.length - 1 && (
                    <div className="lg:hidden flex justify-center my-1">
                      <ArrowRight size={20} className="text-[#FF8C00] rotate-90" />
                    </div>
                  )}

                  {/* Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#FF8C00]/30 transition-all cursor-pointer w-full text-center h-full flex flex-col justify-start">
                    <div className="text-xs font-bold text-[#FF8C00] mb-1">PASSO {step.num}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECAO - Otimização da Manutenção */}
      <section id="otimizacao-manutencao" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Otimização da Manutenção
          </h2>
          <p className="text-gray-600 text-lg text-center mb-16 max-w-3xl mx-auto">
            Otimize a manutenção preventiva das torres de transmissão
          </p>

          <div className="max-w-xs mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white shadow-lg mb-4">
                <Camera size={28} />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#FF8C00]/30 transition-all cursor-pointer w-full text-center h-full flex flex-col justify-start">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Thea</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Visão computacional para a gestão de ativos e detecção de anomalias em torres de transmissão
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECAO 3 - O Que Fazemos */}
      <section id="o-que-fazemos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            O Que Fazemos
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {pilares.map((pilar) => (
              <div key={pilar.num} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-[#FF8C00] font-bold text-2xl mb-3">{pilar.num}</div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF8C00] mb-4">
                  {pilar.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{pilar.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SECAO - Parcerias */}
      <section id="parcerias" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Parcerias Estratégicas e Ecossistema de Inovação
          </h2>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {Array.from({ length: carouselTotal }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                    {parceriasImgs.slice(pageIdx * 4, pageIdx * 4 + 4).map((img, i) => (
                      <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center h-48">
                        <img src={img.src} alt={img.alt} className="max-h-36 max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Controles */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselTotal - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all shadow-sm"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: carouselTotal }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === carouselIndex ? 'bg-[#FF8C00] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCarouselIndex((prev) => (prev === carouselTotal - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all shadow-sm"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECAO - Clientes */}
      <section id="clientes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Quem Já Acredita em Nós
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto text-center">
            Distribuidoras e empresas do setor elétrico brasileiro,
            incluindo grande empresa de equipamentos gerais e elétricos.
          </p>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${clientesIndex * 100}%)` }}
              >
                {Array.from({ length: clientesTotal }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                    {clientesImgs.slice(pageIdx * 4, pageIdx * 4 + 4).map((img, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center h-48">
                        <img src={img.src} alt={img.alt} className="max-h-36 max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Controles */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setClientesIndex((prev) => (prev === 0 ? clientesTotal - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all shadow-sm"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: clientesTotal }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setClientesIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === clientesIndex ? 'bg-[#FF8C00] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setClientesIndex((prev) => (prev === clientesTotal - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all shadow-sm"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECAO - CTA Final / Contato */}
      <section id="contato" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Pronto para transformar dados em decisoes?
          </h2>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Fale com nossos especialistas e descubra como a FoX IoT pode
            impulsionar a eficiencia operacional da sua empresa de energia.
          </p>

          <form onSubmit={handleSubmit(onSubmitContact)} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  placeholder="Seu nome"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FF8C00]'}`}
                  {...register('fullName', { required: 'Nome e obrigatorio' })}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FF8C00]'}`}
                  {...register('email', {
                    required: 'Email e obrigatorio',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalido' },
                  })}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  placeholder="Nome da empresa"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                  {...register('companyName')}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenho interesse em:
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all cursor-pointer"
                {...register('interestedIn')}
              >
                <option value="">Selecione...</option>
                <option value="prometeu">Prometeu - Descoberta de Rede</option>
                <option value="hefesto">Hefesto - Cadastro e Detecção de Fraudes</option>
                <option value="spinon">Spinon - IoT e Medições</option>
                <option value="apollo">Apollo - IA e Análise de Cargas</option>
                <option value="urania">Urania - Gêmeo Digital da Rede</option>
                <option value="thea">Thea - Visão Computacional e Manutenção</option>
                <option value="pdi">Projetos de P&D (PDI ANEEL)</option>
                <option value="partnership">Parceria comercial</option>
                <option value="other">Outros assuntos</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                rows={4}
                placeholder="Como podemos ajudar?"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FF8C00]'}`}
                {...register('message', { required: 'Mensagem e obrigatoria', minLength: { value: 10, message: 'Mensagem deve ter pelo menos 10 caracteres' } })}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-6 rounded-full text-sm font-medium bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] text-white hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Enviar mensagem
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Ou entre em contato: contato@foxiot.com.br
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">F</span>
                </div>
                <span className="text-xl font-bold">FoX IoT</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empresa brasileira de base tecnologica especializada em IoT, IA e analise de dados para o setor eletrico.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soluções</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#jornada-distribuicao" className="hover:text-white transition-colors">Jornada de Distribuição</a></li>
                <li><a href="#otimizacao-manutencao" className="hover:text-white transition-colors">Otimização da Manutenção</a></li>
                <li><a href="#o-que-fazemos" className="hover:text-white transition-colors">O Que Fazemos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#quem-somos" className="hover:text-white transition-colors">Quem somos</a></li>
                <li><a href="#parcerias" className="hover:text-white transition-colors">Parcerias</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#contato" className="hover:text-white transition-colors">Fale Conosco</a></li>
                <li><span>contato@foxiot.com.br</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 FoX IoT. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
