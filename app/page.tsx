// app/page.tsx
"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { RoutinaBranding } from "@/components/auth/routina-branding";
import { ParticlesBackground } from "@/components/ui/particles-background";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a103c] to-[#110926] flex flex-col items-center justify-start px-4 py-8">
      {/* Partículas de fundo */}
      <ParticlesBackground />
      
      {/* Logo e nome Routina */}
      <div className="relative z-10 mb-12 mt-16">
        <RoutinaBranding />
      </div>
      
      {/* Card de login parcialmente visível */}
      <div className="w-full max-w-md relative z-10">
        <AuthForm />
      </div>
    </main>
  );
}