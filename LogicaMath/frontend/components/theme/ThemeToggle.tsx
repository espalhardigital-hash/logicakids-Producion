import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: theme === 'light' ? 45 : -15 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[999] p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border cursor-pointer select-none
                 bg-white border-slate-200 text-amber-500 hover:bg-slate-50
                 dark:bg-[#162033] dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800
                 transition-colors duration-300"
      aria-label="Alternar Tema Claro/Oscuro"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' ? (
            <Sun size={22} className="fill-amber-500/20" />
          ) : (
            <Moon size={22} className="fill-indigo-500/20" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
