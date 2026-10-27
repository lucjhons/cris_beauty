import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  LogOut,
  Plus,
  XCircle,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Appointment } from '../types/index.ts';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal.tsx';

interface ClientDashboardProps {
  setCurrentTab: (tab: string) => void;
  onBookAgain: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ setCurrentTab, onBookAgain }) => {
  const { user, token, logout, updateProfile } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'security'>('appointments');

  // Profile edit states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password edit states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancellation protection modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Prompt confirmation modal before cancelling
  const requestCancelAppointment = (id: number) => {
    setCancelingAppointmentId(id);
    setCancelModalOpen(true);
  };

  // Execute cancellation after confirmation
  const handleConfirmCancelAppointment = async () => {
    if (!token || !cancelingAppointmentId) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/appointments/${cancelingAppointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCancelModalOpen(false);
        setCancelingAppointmentId(null);
        await fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao cancelar agendamento.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  // Load client's own appointments
  const fetchAppointments = async () => {
    if (!token) return;
    setLoadingAppointments(true);
    try {
      const res = await fetch('/api/appointments/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      await updateProfile({ name, phone });
      setProfileMessage({ type: 'success', text: 'Dados cadastrais atualizados com sucesso!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'A confirmação de senha não confere.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Erro ao atualizar senha.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Identify next upcoming appointment
  const nowStr = new Date().toISOString().split('T')[0];
  const nextAppointment = appointments.find(
    (a) => (a.status === 'agendado' || a.status === 'confirmado') && a.date >= nowStr
  );

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Greeting Card */}
        <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#985868] to-[#C78292] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#985868]">Área Exclusiva do Cliente</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Olá, {user?.name}!
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {user?.email} {user?.phone ? `• ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onBookAgain}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] shadow-sm hover:scale-105 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Agendamento
            </button>
            <button
              onClick={() => {
                logout();
                setCurrentTab('home');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>

        {/* Dashboard Subtabs Navigation */}
        <div className="flex border-b border-[#EADBD7] mb-8 space-x-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'appointments'
                ? 'border-[#985868] text-[#985868]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Meus Agendamentos & Histórico
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#985868] text-[#985868]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'security'
                ? 'border-[#985868] text-[#985868]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            Segurança & Senha
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS & NEXT VISIT */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            
            {/* NEXT UPCOMING APPOINTMENT HIGHLIGHT */}
            {nextAppointment ? (
              <div className="bg-gradient-to-br from-[#FFF9F9] to-[#FAF2F2] border-2 border-[#E7C9CF] rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#985868]">
                      Próximo Atendimento Confirmado
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1 bg-white border border-[#E7C9CF] rounded-lg text-stone-800">
                    Cód: {nextAppointment.code}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#985868] flex items-center justify-center border border-[#E7C9CF]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-stone-500 uppercase font-semibold">Data</p>
                      <p className="text-base font-bold text-stone-900">
                        {nextAppointment.date.split('-').reverse().join('/')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#985868] flex items-center justify-center border border-[#E7C9CF]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-stone-500 uppercase font-semibold">Horário & Duração</p>
                      <p className="text-base font-bold text-stone-900">
                        {nextAppointment.timeSlot} ({nextAppointment.totalDuration} min)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#985868] flex items-center justify-center border border-[#E7C9CF]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-stone-500 uppercase font-semibold">Valor Total</p>
                      <p className="text-base font-bold text-[#985868]">
                        R$ {parseFloat(nextAppointment.totalPrice).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EED7DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-stone-500">Serviços: </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {nextAppointment.items?.map((i) => i.serviceName).join(', ')}
                    </span>
                  </div>

                  <button
                    onClick={() => requestCancelAppointment(nextAppointment.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancelar este agendamento
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#EADBD7] p-8 text-center">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-800">Nenhum agendamento futuro</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Você não tem nenhum atendimento agendado para os próximos dias. Que tal reservar um momento especial?
                </p>
                <button
                  onClick={onBookAgain}
                  className="mt-4 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59]"
                >
                  Agendar Agora
                </button>
              </div>
            )}

            {/* FULL APPOINTMENTS HISTORY */}
            <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#985868]" />
                  Histórico Completo de Atendimentos
                </h3>
                <span className="text-xs text-stone-500">
                  Total de {appointments.length} registro(s)
                </span>
              </div>

              {loadingAppointments ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#985868] mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Carregando seus atendimentos...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  Nenhum registro encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600">
                    <thead className="bg-[#FAF7F5] text-stone-800 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Código</th>
                        <th className="py-3 px-4">Data e Hora</th>
                        <th className="py-3 px-4">Serviços</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Pagamento</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {appointments.map((apt) => {
                        const statusColors: Record<string, string> = {
                          agendado: 'bg-blue-50 text-blue-800 border-blue-200',
                          confirmado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          concluido: 'bg-stone-100 text-stone-700 border-stone-200',
                          cancelado: 'bg-rose-50 text-rose-800 border-rose-200',
                        };

                        const paymentColors: Record<string, string> = {
                          pendente: 'text-amber-600',
                          confirmado: 'text-emerald-600 font-bold',
                          recusado: 'text-rose-600',
                          reembolsado: 'text-purple-600',
                        };

                        return (
                          <tr key={apt.id} className="hover:bg-[#FAF7F5] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                              {apt.code}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <p className="font-semibold text-stone-800">
                                {apt.date.split('-').reverse().join('/')}
                              </p>
                              <p className="text-[11px] text-stone-500">{apt.timeSlot}</p>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate">
                              {apt.items?.map((i) => i.serviceName).join(', ') || 'Serviços'}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                              R$ {parseFloat(apt.totalPrice).toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                                  statusColors[apt.status] || 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`capitalize text-[11px] ${paymentColors[apt.paymentStatus] || ''}`}>
                                {apt.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {apt.status !== 'cancelado' && apt.status !== 'concluido' ? (
                                <button
                                  onClick={() => requestCancelAppointment(apt.id)}
                                  className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold underline"
                                >
                                  Cancelar
                                </button>
                              ) : (
                                <button
                                  onClick={onBookAgain}
                                  className="text-[#985868] hover:text-[#7A404F] text-[11px] font-semibold flex items-center gap-0.5 justify-end"
                                >
                                  Repetir <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PROFILE DATA */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#EADBD7] p-8 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              Seus Dados Cadastrais
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Mantenha seu telefone e nome atualizados para receber confirmações de horários.
            </p>

            {profileMessage && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  E-mail (Identificador da conta)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-100 text-stone-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">O e-mail não pode ser alterado diretamente por questões de segurança.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full mt-4 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#EADBD7] p-8 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              Alteração de Senha
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Para sua segurança, informe sua senha atual antes de cadastrar uma nova senha.
            </p>

            {passwordMessage && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Senha Atual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full mt-4 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Alterando Senha...
                  </>
                ) : (
                  'Salvar Nova Senha'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Protected Action Confirmation Modal */}
        <ActionConfirmationModal
          isOpen={cancelModalOpen}
          isDestructive={true}
          isLoading={cancelLoading}
          title="Confirmar Cancelamento"
          description="Você tem certeza que deseja cancelar este agendamento? O horário será liberado na agenda e esta ação não poderá ser desfeita."
          confirmLabel="Sim, Cancelar Agendamento"
          cancelLabel="Manter Agendamento"
          onConfirm={handleConfirmCancelAppointment}
          onCancel={() => {
            setCancelModalOpen(false);
            setCancelingAppointmentId(null);
          }}
        />

      </div>
    </div>
  );
};
