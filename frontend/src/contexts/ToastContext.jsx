import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-100 flex flex-col gap-3 w-[calc(100%-2rem)] sm:w-96 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 animate-toast-in overflow-hidden relative ${
              toast.type === 'success'
                ? 'bg-slate-950/80 border-emerald-500/20 text-slate-100 shadow-emerald-500/5'
                : toast.type === 'error'
                ? 'bg-slate-950/80 border-rose-500/20 text-slate-100 shadow-rose-500/5'
                : 'bg-slate-950/80 border-brand-primary/20 text-slate-100 shadow-brand-primary/5'
            }`}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                  ✕
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  ℹ
                </div>
              )}
            </div>

            {/* Content message */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 leading-relaxed pr-2">{toast.message}</p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-500 hover:text-slate-200 text-xs p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Ambient dynamic accent glow bar inside toast */}
            <div
              className={`absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-[4000ms] ease-linear w-full origin-left ${
                toast.type === 'success'
                  ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                  : toast.type === 'error'
                  ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                  : 'bg-brand-primary shadow-md shadow-brand-primary/50'
              }`}
              style={{
                animation: `shrink-progress ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
