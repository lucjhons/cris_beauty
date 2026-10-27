import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { ClientDashboard } from './pages/ClientDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AboutAndContactPage } from './pages/AboutAndContactPage.tsx';
import { Service, SalonSettings } from './types/index.ts';
import { MessageCircle } from 'lucide-react';
import { PixelBug } from './components/PixelBug.tsx';

function MainApp() {
  const { user } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Selected services (persisted across pages and during login!)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Services catalog
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Salon settings
  const [settings, setSettings] = useState<SalonSettings>({});

  // Fetch Services & Settings
  const loadData = async () => {
    try {
      const [servicesRes, settingsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/settings'),
      ]);

      if (servicesRes.ok) {
        const sData = await servicesRes.json();
        setServices(sData.services || []);
      }

      if (settingsRes.ok) {
        const settsData = await settingsRes.json();
        setSettings(settsData.settings || {});
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle service selection
  const handleToggleSelectService = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Select single service from home and transition to booking
  const handleSelectServiceForBooking = (serviceId: number) => {
    if (!selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds((prev) => [...prev, serviceId]);
    }
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSelectedServices = () => {
    setSelectedServiceIds([]);
  };

  const handleProceedToBooking = () => {
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: string) => {
    if (role === 'admin') {
      setCurrentTab('admin-dashboard');
    } else {
      // If client was already choosing services, return to booking, else dashboard
      if (selectedServiceIds.length > 0) {
        setCurrentTab('booking');
      } else {
        setCurrentTab('client-dashboard');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = settings.whatsapp || '5511987654321';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento Cris_Beauty.')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-stone-900 selection:bg-[#F3D7D7] selection:text-[#5B2939]">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            services={services}
            settings={settings}
            setCurrentTab={setCurrentTab}
            onSelectServiceForBooking={handleSelectServiceForBooking}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            selectedServiceIds={selectedServiceIds}
            onToggleSelectService={handleToggleSelectService}
            onClearSelectedServices={handleClearSelectedServices}
            onProceedToBooking={handleProceedToBooking}
          />
        )}

        {currentTab === 'booking' && (
          <BookingPage
            services={services}
            selectedServiceIds={selectedServiceIds}
            onToggleSelectService={handleToggleSelectService}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            setCurrentTab={setCurrentTab}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentTab === 'register' && (
          <RegisterPage setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'forgot-password' && (
          <ForgotPasswordPage setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'client-dashboard' && (
          <ClientDashboard
            setCurrentTab={setCurrentTab}
            onBookAgain={() => {
              setCurrentTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            setCurrentTab={setCurrentTab}
            salonSettings={settings}
            onRefreshSettings={loadData}
          />
        )}

        {(currentTab === 'about' || currentTab === 'contact') && (
          <AboutAndContactPage
            settings={settings}
            setCurrentTab={setCurrentTab}
          />
        )}
      </main>

      {/* Floating WhatsApp Quick Action Button */}
      <aside aria-label="Atendimento rápido" className="fixed bottom-6 right-6 z-40">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group"
          title="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-16 bg-[#1F1B1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            WhatsApp Cris_Beauty
          </span>
        </a>
      </aside>

      {/* Footer */}
      <Footer settings={settings} setCurrentTab={setCurrentTab} />

      <PixelBug />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
