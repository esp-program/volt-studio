import React, { useState } from 'react';
import { CommunitySketch } from '../../types/ide';
import { highlightCode } from '../../utils/codeHighlighter';
import { X, Copy, Check, ArrowRight, Download } from 'lucide-react';

interface CodePreviewModalProps {
  sketch: CommunitySketch | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoEditor: (sketch: CommunitySketch) => void;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  sketch,
  isOpen,
  onClose,
  onLoadIntoEditor
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sketch) return null;

  const currentFile = sketch.files[activeTabIdx] || sketch.files[0];
  const highlighted = highlightCode(currentFile?.content || '');

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-4xl w-full h-[85vh] flex flex-col text-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1117] border-b border-[#30363d]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{sketch.title}</h2>
              {sketch.isUserCreated && (
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-medium border border-teal-500/40">
                  Your Publication
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              By {sketch.author} · {sketch.date} · Target: {sketch.boardId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLoadIntoEditor(sketch);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <span>Load into Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-4 bg-[#12161f] border-b border-[#30363d] text-xs">
          <div className="flex items-center">
            {sketch.files.map((file, idx) => (
              <button
                key={file.name}
                type="button"
                onClick={() => setActiveTabIdx(idx)}
                className={`px-3 py-2 border-r border-[#30363d] font-mono transition-colors ${
                  activeTabIdx === idx
                    ? 'bg-[#0d1117] text-teal-400 font-semibold border-b-2 border-b-teal-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-[#21262d] rounded transition-colors text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-[#21262d] rounded transition-colors text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 bg-[#090d13] p-4 overflow-auto font-mono text-xs text-slate-200 leading-6">
          <pre
            className="m-0 select-text font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>

        {/* Footer with Description and Required Libraries */}
        <div className="p-3 bg-[#161b22] border-t border-[#30363d] text-xs text-slate-300 flex items-center justify-between">
          <div className="truncate max-w-xl text-slate-400">
            {sketch.description}
          </div>
          {sketch.requiredLibraries.length > 0 && (
            <div className="text-[11px] text-teal-400 font-mono shrink-0 ml-4">
              Requires: {sketch.requiredLibraries.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
