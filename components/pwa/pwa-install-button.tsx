'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from './pwa-provider';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const { isInstallable, isStandalone, deviceType, promptInstall } = usePWA();

  // Não mostrar se já estiver instalado ou não for instalável
  if (isStandalone || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    if (deviceType === 'android') {
      await promptInstall();
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    minimal: 'text-purple-400 hover:text-purple-300',
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center space-x-2 rounded-xl font-semibold transition-all
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {variant === 'minimal' ? (
        <Download className="w-4 h-4" />
      ) : (
        <>
          <Smartphone className="w-4 h-4" />
          <span>Instalar App</span>
        </>
      )}
    </motion.button>
  );
};

export default PWAInstallButton;