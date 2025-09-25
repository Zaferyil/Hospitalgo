import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

const PWAInstaller = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ SW registriert: ', registration);
          })
          .catch((registrationError) => {
            console.log('❌ SW Registrierung fehlgeschlagen: ', registrationError);
          });
      });
    }

    // Auf beforeinstallprompt Event hören
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Benutzer hat die Installation akzeptiert');
    } else {
      console.log('❌ Benutzer hat die Installation abgelehnt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              App installieren
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Installieren Sie HospitalGo auf Ihrem Gerät für schnelleren Zugriff!
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            <Download className="h-4 w-4" />
            <span>Installieren</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;