'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwa } from '@/hooks/use-pwa';

function detectPlatform() {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const DISMISSED_KEY = 'pfa-install-dismissed';

export function PwaInstallBanner() {
  const { installPrompt, isInstalled, isOnline, installApp } = usePwa();
  const [platform, setPlatform] = useState<string>('unknown');
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flicker
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      !!(navigator as any).standalone
    );
    setDismissed(!!localStorage.getItem(DISMISSED_KEY));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    await installApp();
    handleDismiss();
  };

  // Don't show if: already installed as PWA, user dismissed, or server
  if (isStandalone || isInstalled || dismissed || platform === 'unknown') return null;

  // iOS: show manual instructions (no beforeinstallprompt on Safari)
  if (platform === 'ios') {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500 flex-shrink-0">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Установить PFA</p>
              <p className="text-xs text-muted-foreground">Добавить на главный экран</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex-shrink-0">1</span>
            <span>Нажми <Share className="h-3.5 w-3.5 inline text-blue-400" /> <strong className="text-foreground">Поделиться</strong> внизу экрана</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex-shrink-0">2</span>
            <span>Выбери <Plus className="h-3.5 w-3.5 inline" /> <strong className="text-foreground">На экран Домой</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex-shrink-0">3</span>
            <span>Нажми <strong className="text-foreground">Добавить</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Android / Desktop Chrome: show install button (only when beforeinstallprompt fired)
  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500 flex-shrink-0">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Установить PFA</p>
            <p className="text-xs text-muted-foreground">Работает офлайн · Как приложение</p>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1 text-xs">
          Не сейчас
        </Button>
        <Button size="sm" onClick={handleInstall} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" /> Установить
        </Button>
      </div>
    </div>
  );
}
