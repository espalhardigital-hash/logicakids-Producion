import React from 'react';
import { motion } from 'framer-motion';
import { Delete, ArrowRight } from 'lucide-react';

interface CustomKeyboardProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitDisabled?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.03,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const keyVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({
  onNumberPress,
  onDelete,
  onSubmit,
  disabled = false,
  submitDisabled = false
}) => {
  // Numbers structured in grid layout matching image: 7-8-9, 4-5-6, 1-2-3
  const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[340px] mx-auto">
      {/* Keyboard Grid Panel */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-5 grid grid-cols-3 gap-4 shadow-2xl select-none"
      >
        {/* Buttons 1 to 9 */}
        {numbers.map((num) => (
          <motion.button
            key={num}
            type="button"
            variants={keyVariants}
            whileHover={!disabled ? { scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => !disabled && onNumberPress(num)}
            disabled={disabled}
            className="aspect-square rounded-[1.5rem] bg-[#1e293b]/50 border border-white/5 text-4xl font-black text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none font-sans"
          >
            {num}
          </motion.button>
        ))}

        {/* Bottom Row - Left: Backspace/Delete */}
        <motion.button
          type="button"
          data-testid="delete-numpad"
          variants={keyVariants}
          whileHover={!disabled ? { scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onDelete()}
          disabled={disabled}
          className="aspect-square rounded-[1.5rem] bg-[#1e293b]/20 border border-red-500/30 text-red-400 flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
        >
          <Delete size={28} />
        </motion.button>

        {/* Bottom Row - Center: 0 */}
        <motion.button
          type="button"
          variants={keyVariants}
          whileHover={!disabled ? { scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onNumberPress('0')}
          disabled={disabled}
          className="aspect-square rounded-[1.5rem] bg-[#1e293b]/50 border border-white/5 text-4xl font-black text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none font-sans"
        >
          0
        </motion.button>

        {/* Bottom Row - Right: Confirm/Submit (Bright Blue Solid) */}
        <motion.button
          type="button"
          data-testid="submit-numpad"
          variants={keyVariants}
          whileHover={!disabled && !submitDisabled ? { scale: 1.05, boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)' } : {}}
          whileTap={!disabled && !submitDisabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && !submitDisabled && onSubmit()}
          disabled={disabled || submitDisabled}
          className="aspect-square rounded-[1.5rem] bg-[#2563eb] hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none border-none"
        >
          <ArrowRight size={32} />
        </motion.button>
      </motion.div>

      {/* Centered Small Label below */}
      <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mt-4 select-none font-sans">
        Teclado Numérico
      </span>
    </div>
  );
};

export default CustomKeyboard;
