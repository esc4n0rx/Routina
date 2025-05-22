'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw } from 'lucide-react';
import { pwaUtils } from '@/utils/pwa-utils';
import { useToast } from '@/hooks/use-toast';

const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkForUpdates = async () => {
      try {
        const hasUpdates = await pwaUtils.checkForUpdates();
        if (hasUpdates && !showUpdate) {
          setShowUpdate(true);
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    };

    // Verificar atualizações a cada 30 minutos
    checkForUpdates();
    interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showUpdate]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await pwaUtils.applyUpdates();
      
      toast({
        title: "Atualização aplicada",
        description: "O aplicativo foi atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao aplicar atualização:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível aplicar a atualização. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Mostrar novamente em 1 hora
    setTimeout(() => setShowUpdate(true), 60 * 60 * 1000);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 shadow-2xl border border-purple-500/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Atualização Disponível
                  </h4>
                  <p className="text-purple-100 text-xs">
                    Nova versão do Routina disponível
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-purple-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Atualizando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>Atualizar</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-purple-200 hover:text-white text-sm transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdateNotification;