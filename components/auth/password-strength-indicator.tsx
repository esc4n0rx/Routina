// components/auth/password-strength-indicator.tsx
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  score: number;
  label: string;
  color: string;
}

export function PasswordStrengthIndicator({ score, label, color }: PasswordStrengthIndicatorProps) {
  if (!label) return null;
  
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(color, "h-full transition-all")}
          style={{ width: `${(score / 4) * 100}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}