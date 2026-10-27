import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Service } from '../types/index.ts';

interface ServicesPageProps {
  services: Service[];
  selectedServiceIds: number[];
  onToggleSelectService: (serviceId: number) => void;
  onClearSelectedServices: () => void;
  onProceedToBooking: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  selectedServiceIds,
  onToggleSelectService,
  onClearSelectedServices,
  onProceedToBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Available categories
  const categories = ['Todos', 'Cabelo', 'Unhas', 'Maquiagem & Sobrancelhas', 'Estética & Pele'];

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todos' || service.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Selected services calculation
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E3E0] text-[#985868] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Catálogo Oficial & Preços Transparentes
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Nossos Serviços & Cuidados
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            Escolha um ou múltiplos procedimentos para seu atendimento. O valor e o tempo total são somados automaticamente.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#EADBD7] shadow-xs mb-8 flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
            <input
              type="text"
              placeholder="Buscar serviço (ex: escova, corte, manicure)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#985868] focus:ring-1 focus:ring-[#985868] bg-[#FAF7F5]"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#985868] text-white shadow-xs'
                    : 'bg-[#FAF7F5] text-stone-600 hover:bg-[#F3E3E0] hover:text-stone-900 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EADBD7] p-8">
            <Filter className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">Nenhum serviço encontrado</h3>
            <p className="text-sm text-stone-500 mt-1">
              Tente buscar com outros termos ou altere a categoria selecionada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => onToggleSelectService(service.id)}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#985868] ring-2 ring-[#985868]/30 shadow-md bg-[#FFFDFC]'
                      : 'border-[#EADBD7] hover:border-[#C78292] hover:shadow-md'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-[#1F1B1C]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {service.category}
                    </div>

                    {/* Selection status indicator */}
                    <div
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#985868] text-white shadow-md'
                          : 'bg-white/80 text-stone-400 backdrop-blur-xs group-hover:bg-white group-hover:text-stone-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-serif text-lg font-bold transition-colors ${isSelected ? 'text-[#985868]' : 'text-stone-900 group-hover:text-[#985868]'}`}>
                          {service.name}
                        </h3>
                        <span className="text-base font-bold text-[#985868] whitespace-nowrap">
                          R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {service.durationMinutes} minutos
                      </span>

                      <span
                        className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                          isSelected
                            ? 'bg-[#985868] text-white'
                            : 'bg-[#FAF7F5] text-stone-700 group-hover:bg-[#F3E3E0] group-hover:text-[#985868]'
                        }`}
                      >
                        {isSelected ? 'Selecionado' : 'Selecionar'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Selection Drawer / Sticky Summary Bar */}
      {selectedServices.length > 0 && (
        <aside aria-label="Resumo de serviços selecionados" className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0CECB] shadow-2xl py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F3E3E0] text-[#985868] flex items-center justify-center font-bold text-sm shrink-0">
                {selectedServices.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900">
                    {selectedServices.length} {selectedServices.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
                  </span>
                  <span className="text-xs text-stone-500">
                    ({totalDuration} min estimados)
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate max-w-md hidden sm:block">
                  {selectedServices.map((s) => s.name).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button
                onClick={onClearSelectedServices}
                className="text-xs text-stone-400 hover:text-stone-700 underline flex items-center gap-1"
                title="Limpar seleção"
              >
                <Trash2 className="w-3 h-3" />
                Limpar
              </button>

              <div className="text-right">
                <span className="text-[10px] text-stone-500 block uppercase tracking-wider">Total</span>
                <span className="text-xl font-bold text-[#985868]">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                onClick={onProceedToBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#985868] to-[#B06B7B] hover:from-[#844A59] hover:to-[#9B5C6C] shadow-md hover:scale-105 transition-all"
              >
                Continuar Agendamento
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </aside>
      )}

    </div>
  );
};
