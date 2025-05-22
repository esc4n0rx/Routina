"use client";

import { useState, forwardRef } from "react";
import { motion } from "framer-motion";

interface NativeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(
  ({ label, type = "text", error, rightIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    return (
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.label
          className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
            isFocused || hasValue 
              ? 'top-2 text-xs text-purple-300' 
              : 'top-4 text-sm text-gray-400'
          }`}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            fontSize: isFocused || hasValue ? '12px' : '14px',
            color: isFocused ? '#c084fc' : '#9ca3af'
          }}
        >
          {label}
        </motion.label>
        
        <motion.div>
          <input
            ref={ref}
            type={type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full h-14 pt-6 pb-2 px-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-500 transition-all duration-200 focus:outline-none ${
              error 
                ? 'border-red-500/50 focus:border-red-400' 
                : 'border-white/10 focus:border-purple-400/50'
            }`}
            style={{
              backdropFilter: 'blur(20px)',
            }}
            {...props}
          />
        </motion.div>
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-2 ml-2"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

NativeInput.displayName = "NativeInput";