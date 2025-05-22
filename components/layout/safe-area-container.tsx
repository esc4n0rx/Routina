// components/layout/safe-area-container.tsx
import React from 'react';
import { useSafeArea } from '@/hooks/use-safe-area';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
  respectTop?: boolean;
  respectBottom?: boolean;
}

export function SafeAreaContainer({
  children,
  className = '',
  respectTop = true,
  respectBottom = true
}: SafeAreaContainerProps) {
  const insets = useSafeArea();

  return (
    <div
      className={`relative ${className}`}
      style={{
        paddingTop: respectTop ? `${insets.top}px` : 0,
        paddingBottom: respectBottom ? `${insets.bottom}px` : 0
      }}
    >
      {children}
    </div>
  );
}