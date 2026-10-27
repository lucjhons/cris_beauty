import React, { useState } from 'react';
import { Sparkles, Calendar, User as UserIcon, LogOut, Menu, X, Shield, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openBookingWithServices?: (serviceIds: number[]) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#EADBD7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#985868] via-[#C78292] to-[#E5B5C0] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 group-hover:text-[#985868] transition-colors">
                Cris<span className="text-[#C78292]">_Beauty</span>
              </span>
              <p className="text-[10px] tracking-widest uppercase text-stone-700 font-medium -mt-1">
                Alta Estética & Salão
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'text-[#985868] bg-[#F4E9E7]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#F8F1EF]'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'services'
                  ? 'text-[#985868] bg-[#F4E9E7]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#F8F1EF]'
              }`}
            >
              Serviços & Preços
            </button>
            <button
              onClick={() => handleNavClick('booking')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'booking'
                  ? 'text-[#985868] bg-[#F4E9E7]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#F8F1EF]'
              }`}
            >
              Agendamento
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'about'
                  ? 'text-[#985868] bg-[#F4E9E7]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#F8F1EF]'
              }`}
            >
              Sobre o Salão
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'contact'
                  ? 'text-[#985868] bg-[#F4E9E7]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-[#F8F1EF]'
              }`}
            >
              Contato
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('booking')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              Agende seu horário
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#D9C4BE] hover:border-[#B06B7B] bg-white text-stone-800 text-sm font-medium shadow-2xs hover:bg-[#FAF4F3] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#EFE3E0] text-[#985868] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 rounded">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-stone-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Conectado como</p>
                      <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
                      <p className="text-xs text-stone-600 truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' ? (
                      <button
                        onClick={() => handleNavClick('admin-dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-900 hover:bg-amber-50 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-700" />
                        Painel Administrativo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavClick('client-dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-stone-500" />
                        Minha Área & Histórico
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        handleNavClick('home');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-stone-100"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#D9C4BE] text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-900 hover:bg-[#F5EBE8] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-600" />
                  Entrar
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF0EE] border border-[#C78292] text-xs font-semibold uppercase tracking-wider text-[#985868] hover:bg-[#985868] hover:text-white transition-all shadow-2xs"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-[#F3E7E4]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EADBD7] bg-[#FAF7F5] px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentTab === 'home' ? 'text-[#985868] bg-[#F4E9E7]' : 'text-stone-700'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentTab === 'services' ? 'text-[#985868] bg-[#F4E9E7]' : 'text-stone-700'
            }`}
          >
            Serviços & Preços
          </button>
          <button
            onClick={() => handleNavClick('booking')}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentTab === 'booking' ? 'text-[#985868] bg-[#F4E9E7]' : 'text-stone-700'
            }`}
          >
            Agendamento Online
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentTab === 'about' ? 'text-[#985868] bg-[#F4E9E7]' : 'text-stone-700'
            }`}
          >
            Sobre o Salão
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentTab === 'contact' ? 'text-[#985868] bg-[#F4E9E7]' : 'text-stone-700'
            }`}
          >
            Contato
          </button>

          <div className="pt-4 border-t border-stone-200 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-white rounded-lg border border-stone-200">
                  <p className="text-xs text-stone-500">Conectado como</p>
                  <p className="text-sm font-semibold text-stone-800">{user.name}</p>
                  <p className="text-xs text-stone-600">{user.email}</p>
                </div>
                {user.role === 'admin' ? (
                  <button
                    onClick={() => handleNavClick('admin-dashboard')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-900 bg-amber-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-amber-700" />
                    Painel Administrativo
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('client-dashboard')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 bg-white border border-stone-200 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-stone-500" />
                    Minha Área & Histórico
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    handleNavClick('home');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-700 bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 text-center text-sm font-medium text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50"
                >
                  Acessar
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#985868] rounded-lg hover:bg-[#844A59]"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
