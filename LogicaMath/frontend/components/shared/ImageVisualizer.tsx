import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

export interface ImageVisualizerProps {
  url: string;
  alt?: string;
  maxHeight?: number;
}

export const ImageVisualizer: React.FC<ImageVisualizerProps> = ({
  url,
  alt = "Ilustración de apoyo",
  maxHeight = 180,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="relative w-full flex justify-center my-4 group">
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/20">
          <img 
            src={url} 
            alt={alt} 
            style={{ maxHeight: `${maxHeight}px`, objectFit: 'contain' }}
            className="w-auto h-auto transition-transform duration-500 group-hover:scale-105"
          />
          <button 
            onClick={() => setIsZoomed(true)}
            className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
            title="Ampliar imagen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={url} 
              alt={alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
