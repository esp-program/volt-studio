import React, { useState } from 'react';
import { Clipboard, X, Check, FileCode, ArrowRight } from 'lucide-react';

interface PasteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPastedCode: (code: string, fileName?: string, isNewTab?: boolean) => void;
  activeFileName: string;
}

export const PasteCodeModal: React.FC<PasteCodeModalProps> = ({
  isOpen,
  onClose,
  onApplyPastedCode,
  activeFileName
}) => {
  const [pastedCode, setPastedCode] = useState('');
  const [targetMode, setTargetMode] = useState<'replace' | 'newTab'>('replace');
  const [newFileName, setNewFileName] = useState('sketch_imported.ino');

  if (!isOpen) return null;

  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPastedCode(text);
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedCode.trim()) return;

    if (targetMode === 'replace') {
      onApplyPastedCode(pastedCode.trim(), activeFileName, false);
    } else {
      let finalName = newFileName.trim() || 'imported.ino';
      if (!finalName.endsWith('.ino') && !finalName.endsWith('.h') && !finalName.endsWith('.cpp')) {
        finalName += '.ino';
      }
      onApplyPastedCode(pastedCode.trim(), finalName, true);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#121721] border border-white/10 rounded-2xl max-w-xl w-full p-5 text-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#243042]">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Paste & Import Microcontroller Code</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">Paste C++ / Arduino Code:</label>
            <button
              type="button"
              onClick={handleClipboardPaste}
              className="px-2.5 py-1 bg-[#1a2332] hover:bg-[#253247] text-cyan-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste from Clipboard</span>
            </button>
          </div>

          <textarea
            rows={10}
            required
            autoFocus
            value={pastedCode}
            onChange={e => setPastedCode(e.target.value)}
            placeholder="Paste your .ino, .h, or .cpp code here..."
            className="w-full bg-[#080c12] border border-[#243042] focus:border-cyan-400 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
          />

          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">Import Destination:</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteDest"
                  checked={targetMode === 'replace'}
                  onChange={() => setTargetMode('replace')}
                  className="text-teal-500 focus:ring-0"
                />
                <span className="text-slate-300">Replace current file ({activeFileName})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteDest"
                  checked={targetMode === 'newTab'}
                  onChange={() => setTargetMode('newTab')}
                  className="text-teal-500 focus:ring-0"
                />
                <span className="text-slate-300">Open in new tab</span>
              </label>
            </div>

            {targetMode === 'newTab' && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="New tab name (e.g. wifi_secrets.h or my_sketch.ino)"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#243042] rounded-lg px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#243042]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1a2332] hover:bg-[#253247] text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pastedCode.trim()}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
            >
              <span>Import Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
