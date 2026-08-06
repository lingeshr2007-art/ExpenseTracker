// src/components/Drawer.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Slide-in card */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-slate-800/60 shadow-2xl p-6 flex flex-col gap-4 relative"
              initial={{ x: "100%" }}
              animate={{ x: 0, transition: { type: "tween", duration: 0.3, ease: "easeOut" } }}
              exit={{ x: "100%" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold font-heading text-slate-950 dark:text-white">
                  {title}
                </h2>
                <button
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                  onClick={onClose}
                  aria-label="Close drawer panel"
                >
                  ✕
                </button>
              </div>

              {/* Contents scroll container */}
              <div className="flex-1 overflow-y-auto pr-1">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
