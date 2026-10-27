import React from 'react';
import { AlertTriangle, ShieldAlert, Check, X, Loader2 } from 'lucide-react';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar Ação',
  cancelLabel = 'Voltar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Ação Protegida & Requer Confirmação
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900 leading-tight">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-6 bg-[#FAF7F5] p-3.5 rounded-xl border border-stone-200">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#985868] hover:bg-[#844A59]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                {confirmLabel}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
