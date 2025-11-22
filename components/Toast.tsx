import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

// Toast Provider Component - Add this to your App.tsx
export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1e293b',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};

// Custom Toast Functions
export const showToast = {
    success: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-500/30`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        ));
    },

    error: (message: string, details?: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-500/30`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">{message}</p>
                            {details && (
                                <p className="mt-1 text-xs text-slate-400">{details}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        ));
    },

    warning: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-yellow-500/30`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        ));
    },

    info: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-500/30`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <Info className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        ));
    },
};

export default showToast;
