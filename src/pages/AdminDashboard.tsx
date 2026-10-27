import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Edit,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Settings,
  FileText,
  Lock,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Service,
  Appointment,
  User,
  AuditLog,
  AdminOverviewMetrics,
  TopServiceMetric,
  SalonSettings,
} from '../types/index.ts';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal.tsx';

interface AdminDashboardProps {
  setCurrentTab: (tab: string) => void;
  salonSettings: SalonSettings;
  onRefreshSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setCurrentTab,
  salonSettings,
  onRefreshSettings,
}) => {
  const { user, token } = useAuth();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'services' | 'clients' | 'settings' | 'audit'>('overview');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Overview data
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [topServices, setTopServices] = useState<TopServiceMetric[]>([]);

  // 2. Appointments data
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [paymentFilter, setPaymentFilter] = useState('todos');

  // 3. Services data
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNewServiceModal, setIsNewServiceModal] = useState(false);

  // 4. Clients data
  const [clients, setClients] = useState<User[]>([]);
  const [clientSearch, setClientSearch] = useState('');

  // 5. Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // 6. Settings form
  const [settingsForm, setSettingsForm] = useState<SalonSettings>(salonSettings);

  // 7. Action Protection Modal State
  const [actionProtection, setActionProtection] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Check if current user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF7F5] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed mb-6">
            Esta área é de acesso exclusivo aos administradores do salão Cris_Beauty. Você não possui permissões administrativas.
          </p>
          <button
            onClick={() => setCurrentTab('home')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59]"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Fetch Overview
  const fetchOverview = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTopServices(data.topServices || []);
      }
    } catch (e) {
      console.error('Overview fetch error:', e);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (statusFilter !== 'todos') params.append('status', statusFilter);
      if (paymentFilter !== 'todos') params.append('paymentStatus', paymentFilter);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error('Appointments fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Services (including inactive for admin)
  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services?includeInactive=true');
      if (res.ok) {
        const data = await res.json();
        setServicesList(data.services || []);
      }
    } catch (e) {
      console.error('Services fetch error:', e);
    }
  };

  // Fetch Clients
  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error('Clients fetch error:', e);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error('Audit logs fetch error:', e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchAppointments();
    fetchServices();
    fetchClients();
    fetchAuditLogs();
  }, [token]);

  // Internal execution of status update
  const executeUpdateAppointmentStatus = async (id: number, newStatus?: string, newPayment?: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPayment,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Status do agendamento atualizado com sucesso!' });
        await fetchAppointments();
        await fetchOverview();
      } else {
        const d = await res.json();
        setMessage({ type: 'error', text: d.error || 'Erro ao atualizar agendamento.' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Erro ao se comunicar com o servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Protected wrapper for appointment status change
  const handleUpdateAppointmentStatus = async (id: number, newStatus?: string, newPayment?: string) => {
    // If setting to 'cancelado', require explicit confirmation
    if (newStatus === 'cancelado') {
      setActionProtection({
        isOpen: true,
        title: 'Cancelar Agendamento',
        description: 'Tem certeza que deseja cancelar este agendamento? Esta ação será registrada no log de auditoria e liberará o horário na agenda.',
        confirmLabel: 'Sim, Cancelar Atendimento',
        isDestructive: true,
        onConfirm: async () => {
          await executeUpdateAppointmentStatus(id, newStatus, newPayment);
          setActionProtection(null);
        },
      });
      return;
    }

    await executeUpdateAppointmentStatus(id, newStatus, newPayment);
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingService) return;
    setActionLoading(true);
    try {
      const isNew = !editingService.id;
      const url = isNew ? '/api/services' : `/api/services/${editingService.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingService),
      });

      const d = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: d.message || 'Serviço salvo com sucesso!' });
        setEditingService(null);
        setIsNewServiceModal(false);
        await fetchServices();
        await fetchOverview();
      } else {
        setMessage({ type: 'error', text: d.error || 'Erro ao salvar serviço.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar serviço.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Internal execution of client status toggle
  const executeToggleClientActive = async (clientId: number, currentActive: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        await fetchClients();
        setMessage({
          type: 'success',
          text: `Cliente ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Protected toggle for client activation
  const handleToggleClientActive = async (clientId: number, currentActive: boolean) => {
    if (currentActive) {
      setActionProtection({
        isOpen: true,
        title: 'Desativar Conta de Cliente',
        description: 'Você tem certeza que deseja desativar esta conta de cliente? O usuário não conseguirá acessar sua área ou fazer novos agendamentos.',
        confirmLabel: 'Sim, Desativar Conta',
        isDestructive: true,
        onConfirm: async () => {
          await executeToggleClientActive(clientId, currentActive);
          setActionProtection(null);
        },
      });
      return;
    }

    await executeToggleClientActive(clientId, currentActive);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: settingsForm }),
      });
      const d = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configurações do salão atualizadas com sucesso!' });
        onRefreshSettings();
      } else {
        setMessage({ type: 'error', text: d.error || 'Erro ao salvar configurações.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded">
                  Admin Master
                </span>
                <span className="text-xs text-stone-500">Conectado: {user.email}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
                Painel Administrativo Cris_Beauty
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchOverview();
                fetchAppointments();
                fetchServices();
              }}
              className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              title="Recarregar Dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('home')}
              className="px-4 py-2 rounded-full border border-[#D9C4BE] text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-[#FAF4F3]"
            >
              Ver Site
            </button>
          </div>
        </div>

        {/* Global Feedback notification */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EADBD7] mb-8 overflow-x-auto space-x-2 sm:space-x-6 scrollbar-none pb-2">
          {[
            { id: 'overview', label: 'Visão Geral & Métricas', icon: TrendingUp },
            { id: 'appointments', label: 'Gestão de Agendamentos', icon: Calendar },
            { id: 'services', label: 'Serviços & Preços', icon: Sparkles },
            { id: 'clients', label: 'Clientes Cadastrados', icon: Users },
            { id: 'settings', label: 'Horários & Salão', icon: Settings },
            { id: 'audit', label: 'Auditoria de Ações', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage(null);
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                  isActive
                    ? 'border-[#985868] text-[#985868]'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW METRICS
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#EADBD7] shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Clientes Cadastrados</span>
                  <Users className="w-4 h-4 text-[#985868]" />
                </div>
                <p className="font-serif text-3xl font-bold text-stone-900">
                  {metrics?.totalClients || 0}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Total de contas criadas</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EADBD7] shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Agendamentos Hoje</span>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-serif text-3xl font-bold text-emerald-700">
                  {metrics?.todayAppointments || 0}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Para o dia de hoje</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EADBD7] shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Próximos / Ativos</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="font-serif text-3xl font-bold text-amber-800">
                  {metrics?.upcomingAppointments || 0}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Concluídos: {metrics?.completedAppointments || 0} • Cancelados: {metrics?.cancelledAppointments || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EADBD7] shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Faturamento Confirmado</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-serif text-3xl font-bold text-[#985868]">
                  R$ {metrics?.confirmedRevenue ? parseFloat(metrics.confirmedRevenue).toFixed(2).replace('.', ',') : '0,00'}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Apenas pagamentos confirmados</p>
              </div>
            </div>

            {/* Top Requested Services */}
            <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#985868]" />
                Serviços Mais Procurados
              </h3>

              {topServices.length === 0 ? (
                <p className="text-xs text-stone-500 py-4">Nenhum atendimento registrado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {topServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F5] border border-stone-200">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#EFE3E0] text-[#985868] text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{service.serviceName}</p>
                          <p className="text-xs text-stone-500">{service.totalBookings} reserva(s) realizadas</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#985868]">
                        R$ {parseFloat(service.totalRevenue || '0').toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: APPOINTMENTS MANAGEMENT
        ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Todos os Agendamentos
              </h3>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-[#FAF7F5]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-[#FAF7F5]"
                >
                  <option value="todos">Status: Todos</option>
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-[#FAF7F5]"
                >
                  <option value="todos">Pagamento: Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="recusado">Recusado</option>
                  <option value="reembolsado">Reembolsado</option>
                </select>

                <button
                  onClick={fetchAppointments}
                  className="px-3 py-1.5 rounded-xl bg-[#985868] text-white text-xs font-semibold hover:bg-[#844A59]"
                >
                  Filtrar
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#985868] mx-auto mb-2" />
                <p className="text-xs text-stone-500">Buscando agendamentos...</p>
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-center py-8 text-xs text-stone-400">Nenhum agendamento encontrado para estes filtros.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-[#FAF7F5] text-stone-800 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-3">Código</th>
                      <th className="py-3 px-3">Cliente</th>
                      <th className="py-3 px-3">Data e Hora</th>
                      <th className="py-3 px-3">Serviços</th>
                      <th className="py-3 px-3">Valor</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#FAF7F5] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">
                          {apt.code}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-stone-900">{apt.client?.name}</p>
                          <p className="text-[10px] text-stone-500">{apt.client?.phone || apt.client?.email}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="font-semibold text-stone-800">
                            {apt.date.split('-').reverse().join('/')}
                          </p>
                          <p className="text-[10px] text-stone-500">{apt.timeSlot}</p>
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate">
                          {apt.items?.map((i: any) => i.serviceName).join(', ')}
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                          R$ {parseFloat(apt.totalPrice).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            disabled={actionLoading}
                            value={apt.status}
                            onChange={(e) => handleUpdateAppointmentStatus(apt.id, e.target.value, undefined)}
                            className="text-[11px] font-semibold rounded-lg border border-stone-200 px-2 py-1 bg-white"
                          >
                            <option value="agendado">Agendado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            disabled={actionLoading}
                            value={apt.paymentStatus}
                            onChange={(e) => handleUpdateAppointmentStatus(apt.id, undefined, e.target.value)}
                            className="text-[11px] font-semibold rounded-lg border border-stone-200 px-2 py-1 bg-white"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="recusado">Recusado</option>
                            <option value="reembolsado">Reembolsado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 3: SERVICES & PRICES MANAGEMENT
        ======================================================== */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Gerenciar Serviços e Preços
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Edite valores, durações ou adicione novos serviços ao catálogo do salão.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingService({
                    name: '',
                    category: 'Cabelo',
                    description: '',
                    price: '50.00',
                    durationMinutes: 45,
                    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
                    isActive: true,
                  });
                  setIsNewServiceModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59]"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Serviço
              </button>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-[#FAF7F5] text-stone-800 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Serviço</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Duração</th>
                    <th className="py-3 px-4">Preço (R$)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {servicesList.map((service) => (
                    <tr key={service.id} className="hover:bg-[#FAF7F5] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{service.name}</p>
                          <p className="text-[10px] text-stone-500 max-w-xs truncate">{service.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{service.category}</td>
                      <td className="py-3 px-4">{service.durationMinutes} min</td>
                      <td className="py-3 px-4 font-bold text-[#985868]">
                        R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setIsNewServiceModal(false);
                          }}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="Editar Serviço"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal for Edit / Add Service */}
            {editingService && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                    {isNewServiceModal ? 'Adicionar Novo Serviço' : `Editar: ${editingService.name}`}
                  </h3>

                  <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">Nome do Serviço</label>
                      <input
                        type="text"
                        required
                        value={editingService.name || ''}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 uppercase mb-1">Categoria</label>
                        <select
                          value={editingService.category || 'Cabelo'}
                          onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                        >
                          <option value="Cabelo">Cabelo</option>
                          <option value="Unhas">Unhas</option>
                          <option value="Maquiagem & Sobrancelhas">Maquiagem & Sobrancelhas</option>
                          <option value="Estética & Pele">Estética & Pele</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 uppercase mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          step="0.50"
                          min="1"
                          required
                          value={editingService.price || ''}
                          onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 uppercase mb-1">Duração (minutos)</label>
                        <input
                          type="number"
                          step="5"
                          min="10"
                          required
                          value={editingService.durationMinutes || 45}
                          onChange={(e) => setEditingService({ ...editingService, durationMinutes: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 uppercase mb-1">Visibilidade no Catálogo</label>
                        <select
                          value={editingService.isActive ? 'true' : 'false'}
                          onChange={(e) => setEditingService({ ...editingService, isActive: e.target.value === 'true' })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo / Oculto</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">URL da Imagem</label>
                      <input
                        type="url"
                        value={editingService.imageUrl || ''}
                        onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">Descrição</label>
                      <textarea
                        rows={2}
                        value={editingService.description || ''}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-full bg-[#985868] text-white font-semibold hover:bg-[#844A59]"
                      >
                        {actionLoading ? 'Salvando...' : 'Salvar Serviço'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 4: CLIENTS MANAGEMENT
        ======================================================== */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Clientes Cadastrados
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Gerencie contas, consulte total de atendimentos e status de ativação.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-[#FAF7F5]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-[#FAF7F5] text-stone-800 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Telefone</th>
                    <th className="py-3 px-4">Total Agendamentos</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {clients
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                        c.email.toLowerCase().includes(clientSearch.toLowerCase())
                    )
                    .map((client) => (
                      <tr key={client.id} className="hover:bg-[#FAF7F5]">
                        <td className="py-3 px-4 font-bold text-stone-900">{client.name}</td>
                        <td className="py-3 px-4">{client.email}</td>
                        <td className="py-3 px-4">{client.phone || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-stone-800">{client.totalAppointments || 0}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              client.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {client.isActive !== false ? 'Ativo' : 'Desativado'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleClientActive(client.id, client.isActive !== false)}
                            className="text-xs font-semibold underline text-stone-600 hover:text-stone-900"
                          >
                            {client.isActive !== false ? 'Desativar Conta' : 'Ativar Conta'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: SETTINGS & SALON CONFIG
        ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Configurações Gerais do Salão
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Edite dados de contato, horário de atendimento, WhatsApp e política de cancelamento exibidos no site.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Nome do Salão</label>
                  <input
                    type="text"
                    value={settingsForm.salon_name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, salon_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={settingsForm.phone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">WhatsApp (com DDI e DDD, apenas números)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Instagram (@usuario)</label>
                  <input
                    type="text"
                    value={settingsForm.instagram || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={settingsForm.address || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Horário de Funcionamento Exibido</label>
                <input
                  type="text"
                  value={settingsForm.opening_hours || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Política de Cancelamento</label>
                <textarea
                  rows={2}
                  value={settingsForm.cancellation_policy || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cancellation_policy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-[#FAF7F5]"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-full bg-[#985868] text-white font-semibold uppercase tracking-wider text-xs hover:bg-[#844A59]"
              >
                {actionLoading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 6: AUDIT LOGS
        ======================================================== */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#EADBD7] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Registro de Auditoria Administrativa
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Histórico de ações críticas realizadas por administradores para total conformidade e rastreabilidade.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-[#FAF7F5] text-stone-800 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Data e Hora</th>
                    <th className="py-3 px-4">Administrador</th>
                    <th className="py-3 px-4">Ação</th>
                    <th className="py-3 px-4">Detalhes</th>
                    <th className="py-3 px-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F5]">
                      <td className="py-3 px-4 whitespace-nowrap text-stone-500">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">{log.adminEmail}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">{log.details || '—'}</td>
                      <td className="py-3 px-4 text-stone-400 font-mono text-[10px]">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Protection Modal */}
        {actionProtection && (
          <ActionConfirmationModal
            isOpen={actionProtection.isOpen}
            title={actionProtection.title}
            description={actionProtection.description}
            confirmLabel={actionProtection.confirmLabel}
            isDestructive={actionProtection.isDestructive}
            isLoading={actionLoading}
            onConfirm={actionProtection.onConfirm}
            onCancel={() => setActionProtection(null)}
          />
        )}

      </div>
    </div>
  );
};
