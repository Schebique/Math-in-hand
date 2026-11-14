import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Smartphone, X, ExternalLink, MoreVertical, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [isInIframe, setIsInIframe] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(false);
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
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Nainstalovat aplikaci do mobilu"
        className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap shrink-0"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Instalovat appku</span>
      </button>

      {showGuide &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setShowGuide(false)}
          >
            <div
              className="relative w-full max-w-sm my-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowGuide(false)}
                aria-label="Zavřít nápovědu"
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 pr-8">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Přidat MathHero na plochu
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {platform === 'android'
                      ? 'Postup pro Chrome na Androidu'
                      : platform === 'ios'
                      ? 'Postup pro Safari na iPhone / iPad'
                      : 'Spouštění jako samostatná aplikace'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                {isInIframe && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-semibold">
                      Aplikace je otevřená uvnitř náhledového okna
                    </p>
                    <p className="leading-relaxed opacity-90">
                      Prohlížeč v tomto režimu nepovolí přidání ikony na plochu. Nejprve ji otevřete v samostatné záložce Chrome:
                    </p>
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Otevřít v samostatném okně</span>
                    </a>
                  </div>
                )}

                {platform === 'android' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MoreVertical className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>V prohlížeči Chrome na Androidu:</span>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        Klepněte na ikonu tří teček <strong>⋮</strong> vpravo nahoře vedle adresního řádku.
                      </li>
                      <li>
                        V menu vyberte položku <strong>Přidat na plochu</strong> (v novějším Chrome pak zvolte <strong>Instalovat</strong>, případně <em>Vytvořit zástupce</em>).
                      </li>
                      <li>
                        Potvrďte tlačítkem <strong>Přidat</strong> – aplikace se objeví mezi ostatními ikonami na ploše.
                      </li>
                    </ol>
                  </div>
                )}

                {platform === 'ios' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Na iPhone / iPad (Safari):</span>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        Klepněte na ikonu <strong>Sdílet</strong> (čtvereček se šipkou nahoru ve spodní liště).
                      </li>
                      <li>
                        Sjeďte dolů a zvolte <strong>Přidat na plochu</strong>.
                      </li>
                      <li>
                        Potvrďte klepnutím na <strong>Přidat</strong>.
                      </li>
                    </ol>
                  </div>
                )}

                {platform === 'desktop' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Na počítači (Chrome / Edge):
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        Klikněte na ikonu instalace v pravé části adresního řádku, nebo otevřete menu <strong>⋮</strong> → <strong>Odeslat, uložit a sdílet</strong> → <strong>Nainstalovat stránku jako aplikaci</strong>.
                      </li>
                    </ol>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      Na mobilu v Android Chrome najdete volbu v menu <strong>⋮</strong> → <strong>Přidat na plochu</strong>.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Rozumím
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
