import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Upload, Download, X, Smartphone, Laptop, Cloud } from 'lucide-react';
import { exportSyncPackage, importSyncPackage } from '../utils/storage';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const [syncCode, setSyncCode] = useState(() => exportSyncPackage());
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const success = importSyncPackage(importCode.trim());
    if (success) {
      setImportStatus('success');
      setTimeout(() => {
        onDataImported();
        onClose();
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([syncCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathHero_Zaloha_${new Date().toISOString().split('T')[0]}.mathsync`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Synchronizace mezi zařízeními
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Přenos pokroku a účtů mezi mobilem, tabletem a počítačem
            </p>
          </div>
        </div>

        {/* Device Sync Concept Illustration */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-xs text-slate-600 dark:text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">Mobil (iOS/Android)</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 font-bold">⟷</span>
          <div className="flex flex-col items-center gap-1">
            <Cloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">Cloud Sync</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 font-bold">⟷</span>
          <div className="flex flex-col items-center gap-1">
            <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">Počítač / Tablet</span>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            1. Váš synchronizační kód (z tohoto zařízení):
          </label>
          <div className="relative">
            <textarea
              readOnly
              value={syncCode}
              rows={3}
              className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kód zkopírován!' : 'Kopírovat kód'}</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Stáhnout zálohu</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            2. Vložit kód z druhého zařízení:
          </label>
          <textarea
            value={importCode}
            onChange={(e) => {
              setImportCode(e.target.value);
              setImportStatus('idle');
            }}
            placeholder="Vložte sem synchronizační kód zkopírovaný z mobilu nebo jiného zařízení..."
            rows={3}
            className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            onClick={handleImport}
            disabled={!importCode.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Načíst a synchronizovat data</span>
          </button>

          {importStatus === 'success' && (
            <p className="text-xs text-emerald-600 font-semibold text-center">
              ✓ Data byla úspěšně synchronizována!
            </p>
          )}
          {importStatus === 'error' && (
            <p className="text-xs text-rose-500 font-semibold text-center">
              Neplatný synchronizační kód. Zkontrolujte prosím zkopírovaný text.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
