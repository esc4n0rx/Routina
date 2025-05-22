"use client";

import { useEffect } from 'react';

export default function ClientLayoutEffects() {
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    
    setAppHeight(); // Define a altura inicial
    
    // Cleanup: remove os event listeners quando o componente é desmontado
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []); // Array de dependências vazio para rodar apenas no mount e unmount

  return null; // Este componente não renderiza nada visualmente
}