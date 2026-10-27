import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
  onLoginSuccess?: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab, onLoginSuccess }) => {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser.role);
      } else {
        if (loggedUser.role === 'admin') {
          setCurrentTab('admin-dashboard');
        } else {
          setCurrentTab('client-dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser.role);
      } else {
        if (loggedUser.role === 'admin') {
          setCurrentTab('admin-dashboard');
        } else {
          setCurrentTab('client-dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar conta Google.');
    } finally {
      setGoogleLoading(false);
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
            Acessar Minha Conta
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Entre para consultar seus agendamentos, histórico e dados no Cris_Beauty
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              E-mail
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setCurrentTab('forgot-password')}
                className="text-xs text-[#985868] hover:underline font-medium"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-stone-600 uppercase tracking-wider">
            ou acesse com
          </span>
        </div>

        {/* Google OAuth Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full py-3 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          Entrar com Google
        </button>

        {/* Prominent Call to Action for Visitors without an account */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <div className="bg-[#FAF0EE] border border-[#E7C9CF] rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-stone-800">
              Não tem uma conta no aplicativo?
            </p>
            <p className="text-[11px] text-stone-600 mt-1 mb-3">
              Crie seu cadastro gratuito em menos de 1 minuto para agendar serviços e acompanhar seus horários.
            </p>
            <button
              onClick={() => setCurrentTab('register')}
              className="w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#985868] hover:bg-[#844A59] transition-all shadow-xs"
            >
              Criar Conta Gratuita
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
