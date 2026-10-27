import React, { useState } from 'react';
import { Sparkles, User as UserIcon, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface RegisterPageProps {
  setCurrentTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentTab }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Mandatory fields check
    if (!formData.name.trim()) {
      setErrorMessage('O nome completo é obrigatório.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('O e-mail é obrigatório.');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Formato de e-mail inválido. Verifique e tente novamente.');
      return;
    }

    // 3. Password length and matching
    if (formData.password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      // Mandatory: Show success message and direct to login, WITHOUT auto-authenticating!
      setSuccessMessage(response.message || 'Cadastro realizado com sucesso! Faça login para continuar.');
      setTimeout(() => {
        setCurrentTab('login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EADBD7] shadow-xl p-8 sm:p-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#985868] to-[#C78292] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Criar Minha Conta
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre-se no Cris_Beauty para agendar e gerenciar seus horários
          </p>
        </div>

        {/* Success message with auto-redirect notice */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{successMessage}</p>
              <p className="mt-1 text-emerald-700">Redirecionando você para a página de login...</p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Nome Completo *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome e sobrenome"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 98765-4321"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Senha (mínimo 6 caracteres) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Confirmar Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(successMessage)}
            className="w-full mt-4 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando Conta...
              </>
            ) : (
              <>
                Criar Conta
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          Já tenho uma conta —{' '}
          <button
            onClick={() => setCurrentTab('login')}
            className="text-[#985868] font-bold hover:underline"
          >
            Acessar
          </button>
        </div>

      </div>
    </div>
  );
};
