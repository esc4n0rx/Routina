// components/ui/auth-input.tsx
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  rightElement?: ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, icon, error, rightElement, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-12 rounded-lg bg-black/30 border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all",
              icon ? "pl-10" : "pl-4",
              rightElement ? "pr-12" : "pr-4",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm ml-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";