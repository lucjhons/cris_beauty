import React, { useState, useRef } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Shield,
  Star,
  Award,
  Heart,
  ChevronRight,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  UserPlus,
  LogIn,
  X,
  Maximize2,
} from 'lucide-react';
import { Service, SalonSettings } from '../types/index.ts';

interface HomeProps {
  services: Service[];
  settings: SalonSettings;
  setCurrentTab: (tab: string) => void;
  onSelectServiceForBooking: (serviceId: number) => void;
}

export const Home: React.FC<HomeProps> = ({
  services,
  settings,
  setCurrentTab,
  onSelectServiceForBooking,
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Dedicated Presentation Section Video Controls
  const presentationVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPresentation = () => {
    if (presentationVideoRef.current) {
      if (presentationVideoRef.current.paused) {
        presentationVideoRef.current.play();
        setIsPlaying(true);
      } else {
        presentationVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMutePresentation = () => {
    if (presentationVideoRef.current) {
      presentationVideoRef.current.muted = !presentationVideoRef.current.muted;
      setIsMuted(presentationVideoRef.current.muted);
    }
  };

  const featuredServices = services.slice(0, 6);

  // Gallery items
  const galleryItems = [
    {
      title: 'Mechas & Morena Iluminada',
      category: 'Cabelo',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Nail Art & Esmaltação em Gel',
      category: 'Unhas',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Make Glam & Pele Glow',
      category: 'Maquiagem',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Design Estruturado de Sobrancelhas',
      category: 'Olhar',
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Tratamentos de Hidratação & Brilho',
      category: 'Cuidados',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Penteados Sociais & Noivas',
      category: 'Ocasiões Especiais',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const whatsappNumber = settings.whatsapp || '5511987654321';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de agendar um horário no Cris_Beauty.')}`;

  return (
    <div className="min-h-screen">
      
      {/* 1. HERO SECTION WITH BACKGROUND VIDEO & HIGH-CONVERSION ACTIONS */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1F1B1C]">
        
        {/* Background Video */}
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-1000"
            style={{ opacity: videoLoaded ? 0.45 : 0 }}
          >
            {/* Multiple video sources for maximum device compatibility */}
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-hairdresser-washing-a-clients-hair-41584-large.mp4"
              type="video/mp4"
            />
          </video>
        )}

        {/* Fallback Background Image */}
        {(!videoLoaded || videoError) && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80')`,
              opacity: 0.45,
            }}
          />
        )}

        {/* Elegant Semitransparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B1C] via-[#1F1B1C]/75 to-[#1F1B1C]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(31,27,28,0.7)_100%)]" />

        {/* Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-200 text-xs sm:text-sm font-medium uppercase tracking-widest mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Sua experiência ruim em beleza e aqui
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
            Realce sua essência com a <br />
            <span className="italic font-normal bg-gradient-to-r from-[#F6D2DC] via-[#E2A6B4] to-[#C78292] bg-clip-text text-transparent">
              sofisticação que você merece
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-stone-300 font-light leading-relaxed mb-8">
            {settings.salon_tagline || 'Cabelos luminosos, unhas impecáveis e estética avançada com atendimento exclusivo, produtos premium e equipe altamente qualificada.'}
          </p>

          {/* Video Presentation Banner Button */}
          <div className="mb-10">
            <button
              onClick={() => {
                const el = document.getElementById('video-presentation-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setVideoModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-amber-200 text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 shadow-md"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              Assistir Vídeo de Apresentação do Salão
            </button>
          </div>

          {/* Call to Actions - Clear Registration & Login Options */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            
            <button
              onClick={() => {
                setCurrentTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] via-[#B06B7B] to-[#985868] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-lg shadow-rose-950/40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Agende seu horário
            </button>

            <button
              onClick={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900 bg-[#FAF0EE] hover:bg-[#F3E3E0] shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#985868]" />
              Criar Conta Gratuita
            </button>

            <button
              onClick={() => {
                setCurrentTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white/50 transition-all flex items-center gap-1.5"
            >
              Conheça nossos serviços
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setCurrentTab('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-full text-xs sm:text-sm font-medium text-stone-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Já tem conta? Entrar
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            <div>
              <p className="font-serif text-3xl font-bold text-amber-200">100%</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Produtos Originais</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-amber-200">12+</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Serviços Especializados</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-amber-200">4.9 / 5</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Avaliação Média</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-amber-200">Ambiente VIP</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Climatizado e Confortável</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DEDICATED VIDEO PRESENTATION SECTION */}
      <section id="video-presentation-section" className="py-20 bg-[#1A1718] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C78292]">
              Tour Visual & Demonstração
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
              Conheça a Experiência Cris_Beauty em Vídeo
            </h2>
            <p className="text-sm text-stone-400 mt-3 leading-relaxed">
              Veja de perto nosso espaço exclusivo, nossos protocolos de biossegurança e o cuidado refinado que dedicamos a cada atendimento.
            </p>
          </div>

          {/* Interactive Player Box */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900 aspect-16/9 max-w-4xl mx-auto group">
            
            <video
              ref={presentationVideoRef}
              playsInline
              loop
              poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
              className="w-full h-full object-cover"
              onClick={togglePlayPresentation}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                type="video/mp4"
              />
            </video>

            {/* Overlay Play button when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlayPresentation}
                className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/30"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#985868] to-[#C78292] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="mt-4 text-sm font-semibold tracking-wide text-white uppercase">
                  Clique para assistir ao vídeo
                </p>
                <span className="text-xs text-stone-300 mt-1">Alta Definição • Tour Cris_Beauty</span>
              </div>
            )}

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayPresentation}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={toggleMutePresentation}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                  title={isMuted ? 'Ativar Áudio' : 'Desativar Áudio'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="text-xs text-stone-300 font-medium hidden sm:inline">
                  Cris_Beauty — Vídeo de Apresentação
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (presentationVideoRef.current?.requestFullscreen) {
                      presentationVideoRef.current.requestFullscreen();
                    }
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                  title="Tela Cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Highlights below video */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8 text-center text-xs text-stone-400">
            <div className="bg-[#242021] p-4 rounded-2xl border border-stone-800">
              <p className="font-semibold text-white text-sm mb-1">Ambiente Planejado</p>
              Salas individuais para estética, bancadas de maquiagem iluminadas e lavatórios massageadores.
            </div>
            <div className="bg-[#242021] p-4 rounded-2xl border border-stone-800">
              <p className="font-semibold text-white text-sm mb-1">Biossegurança e Autoclave</p>
              Instrumentos de manicure e estética esterilizados em autoclave com embalagens seladas.
            </div>
            <div className="bg-[#242021] p-4 rounded-2xl border border-stone-800">
              <p className="font-semibold text-white text-sm mb-1">Consultoria de Visagismo</p>
              Avaliação de formato de rosto, tons de pele e estilo pessoal antes de cada transformação.
            </div>
          </div>

        </div>
      </section>

      {/* 3. DIFFERENTIALS / DIFERENCIAIS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#985868]">Por que escolher o Cris_Beauty</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
              Diferenciais que encantam em cada atendimento
            </h2>
            <div className="w-16 h-0.5 bg-[#C78292] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-8 rounded-2xl bg-[#FAF7F5] border border-[#EADBD7] hover:border-[#C78292] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F3E3E0] text-[#985868] flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Profissionais Certificados</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Equipe em constante aprimoramento com as principais técnicas mundiais de visagismo, corte, colorimetria e estética.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF7F5] border border-[#EADBD7] hover:border-[#C78292] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F3E3E0] text-[#985868] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Cosméticos de Alto Padrão</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Utilizamos exclusivamente marcas consagradas como L'Oréal Professionnel, Kérastase, Wella e linhas dermatológicas seguras.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF7F5] border border-[#EADBD7] hover:border-[#C78292] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F3E3E0] text-[#985868] flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Biossegurança e Higiene</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Materiais esterilizados em autoclave hospitalar, descartáveis de uso único e protocolos sanitários rigorosos.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF7F5] border border-[#EADBD7] hover:border-[#C78292] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F3E3E0] text-[#985868] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Pontualidade & Conforto</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Respeito absoluto ao seu tempo. Ambiente aconchegante com café gourmet, Wi-Fi veloz e trilha sonora relaxante.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURED SERVICES */}
      <section className="py-20 bg-[#FAF7F5] border-t border-[#EADBD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#985868]">Menu de Cuidados</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                Serviços em Destaque
              </h2>
            </div>
            <button
              onClick={() => {
                setCurrentTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#985868] hover:text-[#7A404F] transition-colors group"
            >
              Ver tabela completa de preços
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8DCD9] shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden bg-stone-100">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#1F1B1C]/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {service.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#985868] transition-colors">
                        {service.name}
                      </h3>
                      <span className="text-lg font-bold text-[#985868] whitespace-nowrap">
                        R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <p className="text-sm text-stone-600 line-clamp-2 mb-4">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {service.durationMinutes} min
                    </span>

                    <button
                      onClick={() => onSelectServiceForBooking(service.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#985868] bg-[#F7EDEA] hover:bg-[#985868] hover:text-white transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Agendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. VISUAL GALLERY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#985868]">Nossos Resultados</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
              Galeria de Trabalhos & Transformações
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Inspire-se com os resultados reais criados por nossos especialistas no Cris_Beauty.
            </p>
            <div className="w-16 h-0.5 bg-[#C78292] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden group aspect-4/5 shadow-xs"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-amber-200">{item.category}</span>
                  <h4 className="font-serif text-lg font-bold mt-0.5">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-[#985868] via-[#B06B7B] to-[#985868] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-8 h-8 text-amber-200 mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Pronta para viver uma experiência exclusiva?
          </h2>
          <p className="text-rose-100 max-w-xl mx-auto text-base mb-8">
            Crie sua conta ou selecione seus serviços favoritos para garantir seu momento de autocuidado.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-full bg-white text-[#985868] font-bold text-sm uppercase tracking-wider shadow-lg hover:bg-stone-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta Gratuita
            </button>
            <button
              onClick={() => {
                setCurrentTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold text-sm uppercase tracking-wider transition-all"
            >
              Agendar Agora
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1EBE5D] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
