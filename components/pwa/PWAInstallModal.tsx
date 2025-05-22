import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Download, Share, Plus, ArrowDown, Chrome, Globe } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface PWAInstallModalProps {
  onInstallComplete?: () => void;
}

type DeviceType = 'android' | 'ios' | 'desktop';
type InstallStep = 'welcome' | 'tutorial' | 'installing' | 'success';

const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onInstallComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [currentStep, setCurrentStep] = useState<InstallStep>('welcome');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Detectar tipo de dispositivo e se já está instalado
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      if (isIOS) return 'ios';
      if (isAndroid) return 'android';
      return 'desktop';
    };

    const checkIfStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    const detected = detectDevice();
    const standalone = checkIfStandalone();
    
    setDeviceType(detected);
    setIsStandalone(standalone);

    // Só mostrar modal se for mobile e não estiver instalado
    if ((detected === 'android' || detected === 'ios') && !standalone) {
      // Verificar se o usuário já rejeitou a instalação hoje
      const rejectedToday = localStorage.getItem('pwa-install-rejected-date');
      const today = new Date().toDateString();
      
      if (rejectedToday !== today) {
        setShowModal(true);
      }
    }
  }, []);

  // Capturar evento de instalação nativa do Android
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deviceType === 'android' && deferredPrompt) {
      // Instalação nativa Android
      setCurrentStep('installing');
      
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setCurrentStep('success');
          setTimeout(() => {
            setShowModal(false);
            onInstallComplete?.();
          }, 2000);
        } else {
          setCurrentStep('welcome');
        }
      } catch (error) {
        console.error('Erro na instalação:', error);
        setCurrentStep('tutorial');
      }
    } else {
      // Mostrar tutorial manual
      setCurrentStep('tutorial');
      setTutorialStep(0);
    }
  };

  const handleRejectInstall = () => {
    // Salvar que o usuário rejeitou hoje (para não mostrar novamente)
    localStorage.setItem('pwa-install-rejected-date', new Date().toDateString());
    setShowModal(false);
  };

  const handleSkipForDesktop = () => {
    setShowModal(false);
    onInstallComplete?.();
  };

  const getTutorialSteps = () => {
    switch (deviceType) {
      case 'android':
        return [
          {
            icon: <Chrome className="w-8 h-8 text-blue-500" />,
            title: "Abra o menu do Chrome",
            description: "Toque nos três pontos (⋮) no canto superior direito",
            image: "/tutorial/android-step1.png"
          },
          {
            icon: <Plus className="w-8 h-8 text-green-500" />,
            title: "Adicionar à tela inicial",
            description: "Toque em 'Adicionar à tela inicial' ou 'Instalar app'",
            image: "/tutorial/android-step2.png"
          },
          {
            icon: <Download className="w-8 h-8 text-purple-500" />,
            title: "Confirmar instalação",
            description: "Toque em 'Adicionar' para instalar o Routina",
            image: "/tutorial/android-step3.png"
          }
        ];
      
      case 'ios':
        return [
          {
            icon: <Globe className="w-8 h-8 text-blue-500" />,
            title: "Abra o Safari",
            description: "Certifique-se de estar usando o Safari (não Chrome)",
            image: "/tutorial/ios-step1.png"
          },
          {
            icon: <Share className="w-8 h-8 text-blue-500" />,
            title: "Toque no ícone Compartilhar",
            description: "Toque no ícone de compartilhar na parte inferior",
            image: "/tutorial/ios-step2.png"
          },
          {
            icon: <Plus className="w-8 h-8 text-green-500" />,
            title: "Adicionar à Tela de Início",
            description: "Toque em 'Adicionar à Tela de Início'",
            image: "/tutorial/ios-step3.png"
          },
          {
            icon: <Download className="w-8 h-8 text-purple-500" />,
            title: "Confirmar",
            description: "Toque em 'Adicionar' para instalar o Routina",
            image: "/tutorial/ios-step4.png"
          }
        ];
      
      default:
        return [];
    }
  };

  const currentTutorialSteps = getTutorialSteps();

  if (isStandalone || !showModal) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md bg-gradient-to-br from-[#0F0A1F] to-[#2D1B4E] rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden"
        >
          {/* Header com gradiente animado */}
          <div className="relative p-6 pb-4">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Botão fechar apenas para desktop */}
            {deviceType === 'desktop' && (
              <button
                onClick={handleSkipForDesktop}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="relative flex flex-col items-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.6)',
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="Routina Logo" 
                  className="w-12 h-12 object-contain rounded-xl"
                />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Instalar Routina
              </h1>
            </div>
          </div>

          {/* Conteúdo do modal baseado no step atual */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  {deviceType === 'desktop' ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <Monitor className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-300 mb-6">
                        Para a melhor experiência, recomendamos usar o Routina no seu smartphone.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={handleSkipForDesktop}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                        >
                          Continuar no Desktop
                        </button>
                        <p className="text-xs text-gray-400">
                          Ou acesse pelo seu celular para instalar o app
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <Smartphone className="w-12 h-12 text-purple-400" />
                      </div>
                      <p className="text-gray-300 mb-6">
                        Instale o Routina como um aplicativo nativo para uma experiência mais rápida e recursos offline.
                      </p>
                      
                      {/* Benefícios da instalação */}
                      <div className="space-y-3 mb-6 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-gray-300">Acesso offline</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-gray-300">Notificações push</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-sm text-gray-300">Abertura mais rápida</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          onClick={handleInstallClick}
                          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span className="relative flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            Instalar Agora
                          </span>
                        </motion.button>
                        
                        <button
                          onClick={handleRejectInstall}
                          className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          Talvez mais tarde
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {currentStep === 'tutorial' && (
                <motion.div
                  key="tutorial"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Como instalar no {deviceType === 'ios' ? 'iPhone' : 'Android'}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-4">
                      {currentTutorialSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === tutorialStep ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tutorialStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white/5 rounded-2xl p-6 text-center"
                    >
                      <div className="flex justify-center mb-4">
                        {currentTutorialSteps[tutorialStep]?.icon}
                      </div>
                      <h4 className="text-white font-semibold mb-2">
                        {currentTutorialSteps[tutorialStep]?.title}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {currentTutorialSteps[tutorialStep]?.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex space-x-3">
                    {tutorialStep > 0 && (
                      <button
                        onClick={() => setTutorialStep(tutorialStep - 1)}
                        className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Anterior
                      </button>
                    )}
                    
                    {tutorialStep < currentTutorialSteps.length - 1 ? (
                      <button
                        onClick={() => setTutorialStep(tutorialStep + 1)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                      >
                        Próximo
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentStep('success');
                          setTimeout(() => {
                            setShowModal(false);
                            onInstallComplete?.();
                          }, 2000);
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                      >
                        Entendi!
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 'installing' && (
                <motion.div
                  key="installing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-white font-semibold">Instalando...</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Aguarde enquanto preparamos tudo para você
                  </p>
                </motion.div>
              )}

              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Instalação Concluída!
                  </h3>
                  <p className="text-gray-300 text-sm">
                    O Routina foi instalado com sucesso. Você pode encontrá-lo na sua tela inicial.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Indicador de que é necessário instalar no mobile */}
          {(deviceType === 'android' || deviceType === 'ios') && currentStep === 'welcome' && (
            <div className="px-6 pb-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <p className="text-amber-300 text-xs">
                    Instalação necessária para usar o aplicativo
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallModal;