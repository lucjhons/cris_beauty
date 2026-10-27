import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Instagram,
  ShieldCheck,
  Award,
  Send,
  CheckCircle2,
  Heart,
  Calendar,
} from 'lucide-react';
import { SalonSettings } from '../types/index.ts';

interface AboutAndContactPageProps {
  settings: SalonSettings;
  setCurrentTab: (tab: string) => void;
}

export const AboutAndContactPage: React.FC<AboutAndContactPageProps> = ({
  settings,
  setCurrentTab,
}) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const whatsappNumber = settings.whatsapp || '5511987654321';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com a equipe Cris_Beauty.')}`;

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryMessage) return;

    // Send via direct WhatsApp message link
    const text = `Olá, me chamo ${inquiryName} (${inquiryPhone}). Mensagem: ${inquiryMessage}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setSentSuccess(true);
    setInquiryName('');
    setInquiryPhone('');
    setInquiryMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* 1. ABOUT SECTION */}
        <section className="bg-white rounded-3xl border border-[#EADBD7] p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E3E0] text-[#985868] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                História & Excelência
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
                Cris<span className="text-[#C78292]">_Beauty</span>: Onde a beleza encontra o bem-estar
              </h1>

              <p className="text-stone-600 text-sm leading-relaxed">
                Fundado com o propósito de proporcionar uma experiência transformadora de autocuidado, o <strong>Cris_Beauty</strong> une alta tecnologia cosmética, visagismo e atendimento humanizado. Cada detalhe do nosso salão foi pensado para que você desfrute de um refúgio de tranquilidade e sofisticação no meio da sua rotina.
              </p>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EFE3E0] text-[#985868] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Produtos selecionados de marcas líderes globais (L'Oréal, Kérastase e Wella).</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EFE3E0] text-[#985868] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Protocolos rigorosos de esterilização hospitalar e biossegurança.</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EFE3E0] text-[#985868] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span>Avaliação personalizada para respeitar a individualidade de cada cliente.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentTab('booking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] shadow-md transition-all hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar um Horário
                </button>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                alt="Ambiente sofisticado Cris_Beauty"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <p className="text-white text-xs font-medium tracking-wide">
                  Ambiente climatizado, aconchegante e higienizado com excelência.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 2. CONTACT & LOCATION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E3E0] text-[#985868] text-xs font-semibold uppercase tracking-wider mb-4">
                <MapPin className="w-3.5 h-3.5" />
                Localização & Informações
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-6">
                Venha nos Visitar
              </h2>

              <div className="space-y-6 text-sm text-stone-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F5] border border-stone-200 text-[#985868] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">Endereço</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {settings.address || 'Alameda das Flores, 450 - Jardins, São Paulo - SP'}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Estacionamento com manobrista no local para sua comodidade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F5] border border-stone-200 text-[#985868] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">Horário de Atendimento</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {settings.opening_hours || 'Terça a Sábado: 09:00 às 19:00'}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Domingo e Segunda: Fechado para descanso da equipe.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F5] border border-stone-200 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">WhatsApp & Telefone</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {settings.phone || '(11) 98765-4321'}
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#25D366] hover:underline"
                    >
                      Conversar no WhatsApp agora
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Oficial
              </a>
              <a
                href={`https://instagram.com/${(settings.instagram || 'crisbeauty.oficial').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-full border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-8 shadow-xs">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Envie uma Mensagem
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Dúvidas sobre tratamentos, horários ou pacotes especiais? Fale diretamente conosco.
            </p>

            {sentSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mensagem encaminhada! Nossa equipe responderá o mais breve possível.</span>
              </div>
            )}

            <form onSubmit={handleSendInquiry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5] focus:outline-hidden focus:border-[#985868]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5] focus:outline-hidden focus:border-[#985868]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Mensagem ou Dúvida *
                </label>
                <textarea
                  rows={4}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Descreva o que você gostaria de saber ou agendar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5] focus:outline-hidden focus:border-[#985868]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </button>
            </form>
          </div>

        </section>

      </div>
    </div>
  );
};
