import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Service, Appointment } from '../types/index.ts';

interface BookingPageProps {
  services: Service[];
  selectedServiceIds: number[];
  onToggleSelectService: (serviceId: number) => void;
  setCurrentTab: (tab: string) => void;
}

interface TimeSlotItem {
  time: string;
  available: boolean;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  services,
  selectedServiceIds,
  onToggleSelectService,
  setCurrentTab,
}) => {
  const { user, token } = useAuth();

  // Selected date (defaults to tomorrow or today if early)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Time slots loaded from backend
  const [availableSlots, setAvailableSlots] = useState<TimeSlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'>('PIX');
  const [notes, setNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Filter selected services
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Fetch real availability from server whenever date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  // Handle final booking submission
  const handleConfirmBooking = async () => {
    if (!user || !token) {
      setBookingError('Você precisa entrar na sua conta para concluir o agendamento.');
      return;
    }

    if (selectedServices.length === 0) {
      setBookingError('Por favor, selecione pelo menos um serviço.');
      return;
    }

    if (!selectedDate) {
      setBookingError('Selecione uma data para o atendimento.');
      return;
    }

    if (!selectedSlot) {
      setBookingError('Escolha um horário disponível para o atendimento.');
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceIds: selectedServiceIds,
          date: selectedDate,
          timeSlot: selectedSlot,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao confirmar agendamento.');
      }

      setConfirmedBooking(data.appointment);
    } catch (err: any) {
      setBookingError(err.message || 'Erro ao realizar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date formatted for min date
  const minDate = new Date().toISOString().split('T')[0];

  // 1. CONFIRMATION VIEW
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#EADBD7] shadow-xl p-8 sm:p-12 text-center">
          
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#985868]">
            Agendamento Realizado com Sucesso
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2 mb-3">
            Esperamos por você, {user?.name.split(' ')[0]}!
          </h2>

          <div className="bg-[#FAF7F5] border border-[#EADBD7] rounded-2xl p-6 my-8 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Código da Reserva</span>
              <span className="font-mono text-base font-bold text-[#985868] bg-[#F3E3E0] px-3 py-1 rounded-md">
                {confirmedBooking.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-500">Data</p>
                <p className="font-semibold text-stone-800">
                  {confirmedBooking.date.split('-').reverse().join('/')}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Horário</p>
                <p className="font-semibold text-stone-800">{confirmedBooking.timeSlot}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Duração Estimada</p>
                <p className="font-semibold text-stone-800">{confirmedBooking.totalDuration} minutos</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Forma de Pagamento</p>
                <p className="font-semibold text-stone-800">{confirmedBooking.paymentMethod}</p>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3">
              <p className="text-xs text-stone-500 mb-2">Serviços Solicitados:</p>
              <ul className="space-y-1 text-sm text-stone-700">
                {confirmedBooking.items?.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>• {item.serviceName}</span>
                    <span className="font-medium text-stone-900">
                      R$ {parseFloat(item.unitPrice).toFixed(2).replace('.', ',')}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold text-base text-[#985868] border-t border-dashed border-stone-300 mt-3 pt-2">
                <span>Valor Total:</span>
                <span>R$ {parseFloat(confirmedBooking.totalPrice).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed mb-8">
            Enviamos os detalhes do seu agendamento para o e-mail cadastrado. Para reagendar ou cancelar com antecedência, consulte sua Área do Cliente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setCurrentTab('client-dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] transition-all"
            >
              Ver na Minha Área
            </button>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setCurrentTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-medium text-stone-700 border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E3E0] text-[#985868] text-xs font-semibold uppercase tracking-wider mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            Agendamento Rápido & Seguro
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Reserve seu Momento de Cuidado
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Confira seus serviços, escolha data e horário disponível em tempo real.
          </p>
        </div>

        {/* Booking Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left & Middle Column (2 cols): Steps & Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: SELECTED SERVICES */}
            <div className="bg-white rounded-2xl border border-[#EADBD7] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#985868] text-white text-xs flex items-center justify-center font-sans font-bold">
                    1
                  </span>
                  Serviços Selecionados
                </h2>

                <button
                  onClick={() => setCurrentTab('services')}
                  className="text-xs text-[#985868] hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar mais serviços
                </button>
              </div>

              {selectedServices.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl p-4">
                  <p className="text-sm text-stone-500 mb-3">
                    Você ainda não selecionou nenhum serviço para agendar.
                  </p>
                  <button
                    onClick={() => setCurrentTab('services')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#985868] text-white hover:bg-[#844A59]"
                  >
                    Ver Catálogo de Serviços
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F5] border border-stone-200"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{service.name}</h4>
                          <p className="text-xs text-stone-500 flex items-center gap-2">
                            <span>{service.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {service.durationMinutes} min
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-[#985868]">
                          R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          onClick={() => onToggleSelectService(service.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remover este serviço"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 2: DATE AND REAL-TIME AVAILABILITY */}
            <div className="bg-white rounded-2xl border border-[#EADBD7] p-6 shadow-xs">
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#985868] text-white text-xs flex items-center justify-center font-sans font-bold">
                  2
                </span>
                Data e Horário do Atendimento
              </h2>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Selecione a Data Desejada
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5] font-medium"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Atendimento de Terça a Sábado das 09:00 às 19:00.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Horários Disponíveis em Tempo Real
                  </label>
                  {loadingSlots && (
                    <span className="text-xs text-[#985868] flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando agenda...
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-10 bg-stone-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                    Nenhum horário aberto para a data selecionada. Escolha outra data.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                          selectedSlot === slot.time
                            ? 'bg-[#985868] text-white shadow-md scale-105'
                            : slot.available
                            ? 'bg-[#FAF7F5] border border-stone-200 text-stone-800 hover:border-[#985868] hover:bg-[#F3E3E0]'
                            : 'bg-stone-100 border border-stone-200 text-stone-300 cursor-not-allowed line-through'
                        }`}
                      >
                        <span className="text-sm">{slot.time}</span>
                        <span className="text-[9px] font-normal uppercase tracking-tighter">
                          {slot.available ? 'Livre' : 'Ocupado'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="bg-white rounded-2xl border border-[#EADBD7] p-6 shadow-xs">
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#985868] text-white text-xs flex items-center justify-center font-sans font-bold">
                  3
                </span>
                Forma de Pagamento Preferida
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                O pagamento é processado e validado no salão na conclusão do seu atendimento ou via chave PIX oficial.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'PIX', label: 'PIX', icon: QrCode },
                  { id: 'Cartão de Crédito', label: 'Crédito', icon: CreditCard },
                  { id: 'Cartão de Débito', label: 'Débito', icon: CreditCard },
                  { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${
                        isChecked
                          ? 'border-[#985868] bg-[#F7EDEA] text-[#985868] ring-1 ring-[#985868]'
                          : 'border-stone-200 bg-[#FAF7F5] text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Observações ou Recomendações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alguma alergia, preferência de estilo ou necessidade especial?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                />
              </div>
            </div>

          </div>

          {/* Right Column (1 col): Summary & Checkout Action */}
          <div className="space-y-6">
            
            {/* AUTH CHECK BANNER */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Identificação Necessária</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Para garantir seu horário e salvar o histórico dos seus atendimentos, acesse sua conta ou cadastre-se em poucos segundos.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setCurrentTab('login')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#985868] text-white hover:bg-[#844A59]"
                      >
                        Acessar Minha Conta
                      </button>
                      <button
                        onClick={() => setCurrentTab('register')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                      >
                        Criar Cadastro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDER SUMMARY CARD */}
            <div className="bg-white rounded-2xl border border-[#EADBD7] p-6 shadow-xs sticky top-24">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-3">
                Resumo da Reserva
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Quantidade de Serviços:</span>
                  <span className="font-semibold text-stone-900">{selectedServices.length}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Duração Estimada:</span>
                  <span className="font-semibold text-stone-900">{totalDuration} min</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Data:</span>
                  <span className="font-semibold text-stone-900">
                    {selectedDate.split('-').reverse().join('/')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Horário Selecionado:</span>
                  <span className={`font-semibold ${selectedSlot ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {selectedSlot || 'Não escolhido'}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Pagamento:</span>
                  <span className="font-semibold text-stone-900">{paymentMethod}</span>
                </div>

                <div className="border-t border-dashed border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-stone-700">Total a Pagar:</span>
                  <span className="font-serif text-2xl font-bold text-[#985868]">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Error Box */}
              {bookingError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Confirm Button */}
              <button
                disabled={submitting || selectedServices.length === 0 || !selectedSlot}
                onClick={handleConfirmBooking}
                className="w-full mt-6 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando no Servidor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Agendamento
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone-400 text-center mt-3">
                Os preços e horários são validados diretamente no servidor para sua total segurança.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
