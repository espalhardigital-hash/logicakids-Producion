import React from 'react';
import { Subject } from '../types';
import { Calculator, Brain, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  subjects: Subject[];
  onSelect: (subject: Subject) => void;
  onBack: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  calculator: <Calculator className="w-10 h-10 text-brand-primary" />,
  brain: <Brain className="w-10 h-10 text-brand-secondary" />,
  math: <Calculator className="w-10 h-10 text-brand-primary" />,
  logic: <Brain className="w-10 h-10 text-brand-secondary" />
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SubjectSelectionScreen: React.FC<Props> = ({ subjects, onSelect, onBack }) => {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-5xl flex flex-col items-center space-y-12"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-2 backdrop-blur-sm">
          <Sparkles size={14} />
          <span>Explora y Aprende</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
          Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Misión</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg md:text-xl font-medium">
          Selecciona tu ruta de entrenamiento. Cada camino está diseñado para potenciar tus habilidades al máximo.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4"
      >
        {subjects.map((subject) => (
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            key={subject.id}
            onClick={() => onSelect(subject)}
            className="group relative flex flex-col items-start p-8 md:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors duration-500 text-left overflow-hidden shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-brand-secondary/10 rounded-full blur-3xl group-hover:bg-brand-secondary/20 transition-colors duration-700"></div>
            
            <div className="flex items-center justify-between w-full mb-8 relative z-10">
              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors duration-500">
                {ICON_MAP[subject.icon || subject.slug] || <BookOpen className="w-10 h-10 text-gray-400" />}
              </div>
              <motion.div
                initial={{ x: 0, opacity: 0.3 }}
                whileHover={{ x: 10, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="text-white" size={36} />
              </motion.div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-primary transition-all relative z-10">
              {subject.name}
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg relative z-10">
              {subject.description || 'Desafía tu mente con actividades diseñadas para tu crecimiento.'}
            </p>
            
            <div className="mt-8 flex items-center space-x-2 text-sm font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 relative z-10">
              <span>Empezar ahora</span>
              <ArrowRight size={16} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="text-gray-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-8 decoration-gray-700 hover:decoration-brand-primary mt-8"
      >
        Volver al inicio
      </motion.button>
    </motion.div>
  );
};

export default SubjectSelectionScreen;
