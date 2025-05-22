// components/auth/routina-branding.tsx
import { motion } from "framer-motion";

export function RoutinaBranding() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3"
    >
      {/* Logo do Routina */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.2
        }}
      >
        <img 
          src="/logo.png" 
          alt="Routina Logo" 
          className="w-16 h-16 object-contain rounded-xl"
        />
      </motion.div>

      {/* Nome Routina */}
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
      >
        Routina
      </motion.h1>
    </motion.div>
  );
}