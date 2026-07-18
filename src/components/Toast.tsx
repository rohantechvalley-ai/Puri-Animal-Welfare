/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.message, hideToast]);

  return (
    <AnimatePresence>
      {toast.message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-full"
          id="toast-notification-root"
        >
          <div className="glass-panel shadow-2xl rounded-2xl border p-4 flex items-start gap-3 backdrop-blur-xl">
            <div className="flex-shrink-0 mt-0.5" id="toast-icon-container">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-brand-emerald animate-pulse" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 animate-bounce" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-brand-blue" />
              )}
            </div>
            
            <div className="flex-grow min-w-0" id="toast-message-content">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={hideToast}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              id="toast-close-btn"
              aria-label="Close Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
