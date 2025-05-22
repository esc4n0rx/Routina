// components/ui/animated-button.tsx
import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary";
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, loading, loadingText, variant = "primary", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full h-12 rounded-lg font-medium text-white focus:outline-none transition-all disabled:opacity-70",
          variant === "primary" && "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90",
          variant === "secondary" && "bg-gray-700 hover:bg-gray-600",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingText || "Carregando..."}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";