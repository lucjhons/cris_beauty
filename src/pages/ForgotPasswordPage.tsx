import React, { useState } from 'react';
import { Sparkles, Mail, User as UserIcon, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2, Info } from 'lucide-react';

interface ForgotPasswordPageProps {
  setCurrentTab: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setCurrentTab }) => {
  // Step 1: Request Token | Step 2: Reset with Token
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 fields
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [setupExplanation, setSetupExplanation] = useState<string | null>(null);

  // Step 1 submit: validate name & email, generate secure single-use token on server
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Informe seu nome completo e e-mail cadastrados.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação.');
      }

      // Populate token directly to allow user to complete verification
      setToken(data.token);
      setSetupExplanation(data.instructions);
      setSuccessMessage('Token de segurança temporário gerado com validade de 1 hora.');
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao iniciar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 submit: validate token, single-use check, update password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setErrorMessage('O token de recuperação é obrigatório.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }

      setSuccessMessage(data.message || 'Senha redefinida com sucesso! Redirecionando para login...');
      setTimeout(() => {
        setCurrentTab('login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao redefinir senha.');
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
            <KeyRound className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Recuperação de Senha
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {step === 1
              ? 'Validação de identidade por token seguro de uso único'
              : 'Definição da nova senha com validação de token'}
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Setup explanation regarding email server configuration */}
        {setupExplanation && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-bold">Aviso de Configuração de E-mail (Servidor):</p>
              <p className="mt-1 text-amber-800 leading-relaxed">{setupExplanation}</p>
            </div>
          </div>
        )}

        {/* STEP 1: SOLICITAR TOKEN */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Nome Completo Cadastrado
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando Servidor...
                </>
              ) : (
                <>
                  Validar Dados e Gerar Token
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: REDEFINIR SENHA COM TOKEN */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Token de Recuperação Seguro (Uso Único)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Código do token"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redefinindo Senha...
                </>
              ) : (
                <>
                  Salvar Nova Senha
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          <button
            onClick={() => setCurrentTab('login')}
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Login
          </button>
        </div>

      </div>
    </div>
  );
};
