import React from 'react';
import { Sparkles, MapPin, Phone, MessageCircle, Clock, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { SalonSettings } from '../types/index.ts';

interface FooterProps {
  settings: SalonSettings;
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setCurrentTab }) => {
  const whatsappNumber = settings.whatsapp || '5511987654321';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de informações sobre os serviços do Cris_Beauty.')}`;

  return (
    <footer className="bg-[#1F1B1C] text-stone-300 border-t border-[#383133]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Concept */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#985868] to-[#C78292] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                Cris<span className="text-[#C78292]">_Beauty</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.salon_tagline || 'Excelência em serviços de estética, cabelos, unhas e maquiagem com atendimento personalizado e produtos de padrão internacional.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2829] hover:bg-[#25D366] text-white flex items-center justify-center transition-all hover:scale-105"
                title="Fale conosco pelo WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://instagram.com/${(settings.instagram || 'crisbeauty.oficial').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2829] hover:bg-gradient-to-tr hover:from-amber-500 hover:to-rose-500 text-white flex items-center justify-center transition-all hover:scale-105"
                title="Siga no Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C78292]"></span>
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Serviços e Tabela de Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentTab('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Agendamento Online
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Sobre o Salão
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Localização e Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C78292]"></span>
              Atendimento & Endereço
            </h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C78292] shrink-0 mt-0.5" />
                <span>{settings.address || 'Alameda das Flores, 450 - Jardins, São Paulo - SP'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C78292] shrink-0" />
                <span>{settings.phone || '(11) 98765-4321'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline decoration-dotted"
                >
                  WhatsApp: {settings.phone || '(11) 98765-4321'}
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Security */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C78292]"></span>
              Horário de Funcionamento
            </h3>
            <div className="space-y-2 text-sm text-stone-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#C78292] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Terça a Sábado</p>
                  <p className="text-stone-400">09:00 às 19:00</p>
                </div>
              </div>
              <div className="pt-2 text-xs text-stone-400">
                <p>Domingo e Segunda: Fechado para descanso da equipe.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Conformidade com a LGPD e privacidade garantida.</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Cris_Beauty — Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com excelência, segurança e sofisticação <Heart className="w-3.5 h-3.5 text-[#C78292] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
