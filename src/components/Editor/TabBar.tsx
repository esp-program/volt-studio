import React, { useState } from 'react';
import { Plus, X, Columns, Layers } from 'lucide-react';
import { SketchFile } from '../../types/ide';

interface TabBarProps {
  files: SketchFile[];
  activeFile: string;
  onSelectFile: (name: string) => void;
  onAddFile: (name: string) => void;
  onDeleteFile: (name: string) => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  isCombinedView: boolean;
  onToggleCombinedView: () => void;
  isOpal?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  isSplitView,
  onToggleSplitView,
  isCombinedView,
  onToggleCombinedView,
  isOpal = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;

    if (!trimmed.endsWith('.h') && !trimmed.endsWith('.cpp') && !trimmed.endsWith('.ino')) {
      setErrorMsg('Use .h, .cpp, or .ino');
      return;
    }

    if (files.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('File already exists');
      return;
    }

    onAddFile(trimmed);
    setNewFileName('');
    setIsAdding(false);
    setErrorMsg('');
  };

  const getFileBadge = (name: string) => {
    if (name.endsWith('.ino')) {
      return <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">INO</span>;
    }
    if (name.endsWith('.h')) {
      return <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">.H</span>;
    }
    return <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold">.CPP</span>;
  };

  return (
    <div className={`flex items-center justify-between px-3 py-1.5 text-xs select-none border-b transition-colors ${
      isOpal ? 'bg-white/70 border-purple-100' : 'bg-[#090d16]/90 border-white/5'
    }`}>
      {/* File Tabs List - Floating Pill Style */}
      <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
        {files.map(file => {
          const isActive = file.name === activeFile && !isCombinedView;
          return (
            <div
              key={file.name}
              onClick={() => {
                if (isCombinedView) onToggleCombinedView();
                onSelectFile(file.name);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap shrink-0 group border ${
                isActive
                  ? isOpal
                    ? 'bg-white text-purple-900 border-purple-300 shadow-[0_2px_12px_rgba(179,136,255,0.25)] font-bold'
                    : 'bg-white/10 text-white border-purple-400/50 shadow-[0_0_15px_rgba(179,136,255,0.2)] font-semibold'
                  : isOpal
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border-transparent'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
              }`}
            >
              {getFileBadge(file.name)}
              <span className="truncate max-w-[130px]">{file.name}</span>
              {!file.isEntry && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteFile(file.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Combined Unit (.h + C++) Tab */}
        <div
          onClick={onToggleCombinedView}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap shrink-0 border ${
            isCombinedView
              ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(112,214,255,0.25)] font-bold'
              : isOpal
              ? 'text-purple-700 hover:bg-purple-100 border-transparent'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border-transparent'
          }`}
          title="Inspect Combined Translation Unit"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate font-medium">Combined (.h + C++)</span>
        </div>

        {isAdding ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1 px-1">
            <input
              type="text"
              autoFocus
              placeholder="e.g. config.h"
              value={newFileName}
              onChange={e => {
                setNewFileName(e.target.value);
                setErrorMsg('');
              }}
              className="bg-black/40 text-slate-200 border border-purple-400 rounded-lg px-2.5 py-1 text-xs focus:outline-none w-28"
            />
            <button
              type="submit"
              className="btn-tornasol text-xs px-2.5 py-1 rounded-lg font-bold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setErrorMsg('');
              }}
              className="p-1 opacity-60 hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all border shrink-0 ${
              isOpal
                ? 'bg-white hover:bg-purple-50 text-slate-600 border-purple-100'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5'
            }`}
            title="Add File (.h or .cpp)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Tab</span>
          </button>
        )}
      </div>

      {/* Split View Toggle */}
      <div className="flex items-center gap-1.5 px-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSplitView}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
            isSplitView
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(179,136,255,0.25)]'
              : isOpal
              ? 'text-slate-600 hover:bg-purple-100 border-transparent'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
          }`}
          title="Toggle Split Dual Editor"
        >
          <Columns className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Split Editor</span>
        </button>
      </div>
    </div>
  );
};
