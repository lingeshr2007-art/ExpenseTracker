// src/components/Modal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-[#23273C] border border-[#E1E0E6] dark:border-[#2D324B] shadow-2xl rounded-2xl p-6 z-10 flex flex-col gap-4"
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-heading text-slate-950 dark:text-white">
                {title}
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                onClick={onClose}
                aria-label="Close modal dialog"
              >
                ✕
              </button>
            </div>

            {/* Contents */}
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
