import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Nainstalovat aplikaci do mobilu"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap shrink-0"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Nainstalovat aplikaci</span>
        <span className="sm:hidden">Appka</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Instalace na mobil (iOS i Android)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Funguje jako plnohodnotná nativní aplikace
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  📱 Na iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Klepněte na ikonu <strong>Sdílet</strong> (čtvereček se šipkou nahoru dole).</li>
                  <li>Sjeďte dolů a zvolte <strong>Přidat na plochu</strong>.</li>
                  <li>Potvrďte tlačítkem <strong>Přidat</strong>.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  🤖 Na Android (Chrome / Brave):
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Klepněte na <strong>tři tečky vpravo nahoře</strong>.</li>
                  <li>Zvolte <strong>Nainstalovat aplikaci</strong> nebo <strong>Přidat na plochu</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Rozumím
            </button>
          </div>
        </div>
      )}
    </>
  );
};
