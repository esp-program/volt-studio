import React, { useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { CompilationResult } from '../../types/ide';

interface OutputConsoleProps {
  compilationResult: CompilationResult | null;
  isCompiling: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onClear: () => void;
  onJumpToError?: (line: number, file: string) => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  compilationResult,
  isCompiling,
  isUploading,
  uploadProgress,
  onClear,
  onJumpToError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [compilationResult, isCompiling, isUploading]);

  return (
    <div className="flex flex-col h-full bg-[#080c14]/95 text-slate-200 font-mono text-xs select-text backdrop-blur-xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 select-none">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white tracking-wide">Tornasol Toolchain Console</span>
          {isCompiling && (
            <span className="text-cyan-300 text-[11px] animate-pulse">Compiling & merging translation unit...</span>
          )}
          {isUploading && (
            <span className="text-amber-300 text-[11px] animate-pulse">
              Flashing firmware ({uploadProgress}%)...
            </span>
          )}
          {compilationResult && !isCompiling && (
            compilationResult.success ? (
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Build Succeeded
              </span>
            ) : (
              <span className="text-rose-400 text-[11px] flex items-center gap-1 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                Build Failed
              </span>
            )
          )}
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-slate-400 hover:text-white p-1"
          title="Clear console"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Memory Utilization Bars with Tornasol Gradients */}
      {compilationResult && compilationResult.success && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 py-2.5 bg-black/20 border-b border-white/5">
          {/* Flash Memory */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-sans">
              <span>Program Flash Storage:</span>
              <span className="font-mono tabular-nums text-cyan-300 font-semibold">
                {compilationResult.flashUsed.toLocaleString()} / {compilationResult.flashTotal.toLocaleString()} B (
                {((compilationResult.flashUsed / compilationResult.flashTotal) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-[1px]">
              <div
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(112,214,255,0.6)]"
                style={{
                  width: `${Math.min(100, (compilationResult.flashUsed / compilationResult.flashTotal) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Dynamic SRAM Memory */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-sans">
              <span>Global SRAM Memory:</span>
              <span className="font-mono tabular-nums text-pink-300 font-semibold">
                {compilationResult.sramUsed.toLocaleString()} / {compilationResult.sramTotal.toLocaleString()} B (
                {((compilationResult.sramUsed / compilationResult.sramTotal) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-[1px]">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,128,191,0.6)]"
                style={{
                  width: `${Math.min(100, (compilationResult.sramUsed / compilationResult.sramTotal) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Callout Banner */}
      {compilationResult && compilationResult.error && (
        <div className="p-3 bg-red-950/40 border-b border-red-800/40 flex items-start justify-between gap-3 text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-red-300">
                {compilationResult.error.file}:{compilationResult.error.line} - {compilationResult.error.message}
              </div>
              <div className="text-[11px] text-red-300/80 mt-0.5">
                Click Jump to Line to inspect and fix in editor.
              </div>
            </div>
          </div>
          {onJumpToError && (
            <button
              type="button"
              onClick={() => onJumpToError(compilationResult.error!.line, compilationResult.error!.file)}
              className="px-2.5 py-1 bg-red-800/60 hover:bg-red-700 text-white rounded text-xs font-medium flex items-center gap-1 shrink-0"
            >
              <span>Jump to Line</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Terminal Text Area */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 bg-[#090d13] font-mono text-xs text-slate-300 leading-relaxed"
      >
        {!compilationResult && !isCompiling && !isUploading ? (
          <div className="text-slate-500 italic py-4">
            Click 'Verify' (✓) or press Ctrl+S to compile the sketch and inspect memory usage.
          </div>
        ) : (
          compilationResult?.logs.map((log, idx) => {
            const isError = log.includes('error:') || log.includes('[FATAL') || log.includes('[SYNTAX') || log.includes('[COMPILER ERROR]');
            const isWarning = log.includes('warning:');
            const isSuccess = log.includes('✓ Compilation complete') || log.includes('OK');
            return (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-all ${
                  isError
                    ? 'text-red-400 font-semibold'
                    : isWarning
                    ? 'text-amber-400'
                    : isSuccess
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            );
          })
        )}

        {isUploading && (
          <div className="text-amber-400 animate-pulse">
            Connecting to programmer... Writing firmware: {uploadProgress}%
          </div>
        )}
      </div>
    </div>
  );
};
