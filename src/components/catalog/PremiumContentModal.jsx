import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumContentModal({ isOpen, onClose, product }) {
  const contentUrl = product?.content_url || product?.drive_link;
  const isContentAvailable = !!contentUrl;

  const handleReadOnline = () => {
    if (contentUrl) {
      window.open(contentUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (!contentUrl) return;
    
    if (contentUrl.includes('drive.google.com')) {
      window.open(contentUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = contentUrl;
      a.download = '';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
          >
            <div className="border-b border-[#2a2a2a] p-6 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-[#f59e0b] mb-1">UffiSolutions</h2>
              <h3 className="text-xl font-bold text-white line-clamp-2">
                {product?.name || product?.title || 'Conteúdo Premium'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6 flex-grow flex flex-col justify-center">
              {isContentAvailable ? (
                <>
                  <p className="text-center text-gray-300 text-sm">
                    Parabéns! Seu conteúdo gratuito foi liberado com sucesso pela UffiSolutions. Aproveite este material exclusivo preparado para acelerar os seus resultados.
                  </p>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleReadOnline}
                      className="flex-1 px-4 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      📖 Ler Online
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      📥 Baixar
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">🚧</div>
                  <h4 className="text-lg font-bold text-gray-200 mb-2">Conteúdo não disponível</h4>
                  <p className="text-gray-400 text-sm">
                    O link de acesso para este material ainda não foi configurado ou está temporariamente indisponível.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#1c1c1c] p-4 border-t border-[#2a2a2a]">
              <p className="text-center text-xs text-gray-500 font-medium">
                Conteúdo exclusivo • Acesso imediato
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}