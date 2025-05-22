"use client";

import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useSafeArea() {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const safeAreaSupported = typeof CSS !== 'undefined' && CSS.supports('padding-top: env(safe-area-inset-top)');
      
      if (safeAreaSupported) {
        const div = document.createElement('div');
        div.style.paddingTop = 'env(safe-area-inset-top)';
        div.style.paddingRight = 'env(safe-area-inset-right)';
        div.style.paddingBottom = 'env(safe-area-inset-bottom)';
        div.style.paddingLeft = 'env(safe-area-inset-left)';
        document.body.appendChild(div);
        
        const computedStyle = window.getComputedStyle(div);

        const top = parseInt(computedStyle.paddingTop) || 0;
        const right = parseInt(computedStyle.paddingRight) || 0;
        const bottom = parseInt(computedStyle.paddingBottom) || 0;
        const left = parseInt(computedStyle.paddingLeft) || 0;
        
        document.body.removeChild(div);
        
        setInsets({ top, right, bottom, left });
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const hasNotch = window.innerWidth / window.innerHeight < 0.5;
        
        const topInset = isIOS ? (hasNotch ? 44 : 20) : 24;
        const bottomInset = isIOS ? (hasNotch ? 34 : 0) : 16;
        
        setInsets({
          top: topInset,
          right: 0,
          bottom: bottomInset,
          left: 0
        });
      }
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return insets;
}