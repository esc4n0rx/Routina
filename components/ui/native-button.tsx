"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface NativeButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function NativeButton({ 
  children, 
  loading = false, 
  variant = 'primary',
  disabled,
  ...props 
}: NativeButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      disabled={isDisabled}
      className="relative w-full h-14 rounded-2xl font-semibold text-white overflow-hidden disabled:opacity-70"
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #9333EA 100%)'
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      }}
      {...props}
    >
      {/* Efeito de brilho animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: loading ? ['-100%', '100%'] : '-100%',
        }}
        transition={{
          duration: 1.5,
          repeat: loading ? Infinity : 0,
          ease: "linear",
        }}
      />
      
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        )}
        {children}
        {!loading && variant === 'primary' && <ArrowRight className="w-5 h-5" />}
      </span>
    </motion.button>
  );
}