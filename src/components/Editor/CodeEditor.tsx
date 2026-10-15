import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TabBar } from './TabBar';
import { SnippetsMenu } from './SnippetsMenu';
import { highlightCode } from '../../utils/codeHighlighter';
import { generateCombinedCode } from '../../utils/compiler';
import { SketchFile } from '../../types/ide';
import { Search, Sparkles, ZoomIn, ZoomOut, Check, AlertCircle, Copy, Merge, Layers, Columns } from 'lucide-react';

interface CodeEditorProps {
  files: SketchFile[];
  activeFileName: string;
  onSelectFile: (name: string) => void;
  onAddFile: (name: string) => void;
  onDeleteFile: (name: string) => void;
  onUpdateContent: (fileName: string, content: string) => void;
  onFlattenFiles?: () => void;
  errorLine?: number | null;
  errorFile?: string | null;
  onQuickVerify?: () => void;
  isOpal?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onUpdateContent,
  onFlattenFiles,
  errorLine,
  errorFile,
  onQuickVerify,
  isOpal = false
}) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  
  const [isSplitView, setIsSplitView] = useState(false);
  const [isCombinedView, setIsCombinedView] = useState(false);
  const [splitSecondaryFileName, setSplitSecondaryFileName] = useState<string>(() => {
    const hFile = files.find(f => f.name.endsWith('.h'));
    return hFile ? hFile.name : (files[1]?.name || files[0].name);
  });
  const [copiedCombined, setCopiedCombined] = useState(false);

  const activeFile = files.find(f => f.name === activeFileName) || files[0];
  const splitSecondaryFile = files.find(f => f.name === splitSecondaryFileName) || files.find(f => f.name.endsWith('.h')) || files[0];

  useEffect(() => {
    if (isSplitView) {
      const hFile = files.find(f => f.name.endsWith('.h'));
      if (hFile && activeFileName !== hFile.name) {
        setSplitSecondaryFileName(hFile.name);
      }
    }
  }, [isSplitView, files, activeFileName]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const secTextareaRef = useRef<HTMLTextAreaElement>(null);
  const secPreRef = useRef<HTMLPreElement>(null);
  const secLineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => {
    return (activeFile?.content || '').split('\n');
  }, [activeFile?.content]);

  const secLines = useMemo(() => {
    return (splitSecondaryFile?.content || '').split('\n');
  }, [splitSecondaryFile?.content]);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSecScroll = () => {
    if (secTextareaRef.current && secPreRef.current) {
      secPreRef.current.scrollTop = secTextareaRef.current.scrollTop;
      secPreRef.current.scrollLeft = secTextareaRef.current.scrollLeft;
    }
    if (secTextareaRef.current && secLineNumbersRef.current) {
      secLineNumbersRef.current.scrollTop = secTextareaRef.current.scrollTop;
    }
  };

  const handleCursorMove = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = activeFile.content.slice(0, pos);
    const lineNum = textBefore.split('\n').length;
    const colNum = pos - textBefore.lastIndexOf('\n');
    setCursorPos({ line: lineNum, col: colNum });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, targetFileName: string, targetContent: string) => {
    const textarea = e.currentTarget;

    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearch(prev => !prev);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onQuickVerify?.();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (e.shiftKey) {
        const lineStart = targetContent.lastIndexOf('\n', start - 1) + 1;
        if (targetContent.slice(lineStart, lineStart + 2) === '  ') {
          const newContent = targetContent.slice(0, lineStart) + targetContent.slice(lineStart + 2);
          onUpdateContent(targetFileName, newContent);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
          }, 0);
        }
      } else {
        const newContent = targetContent.slice(0, start) + '  ' + targetContent.slice(end);
        onUpdateContent(targetFileName, newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }

    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const lineStart = targetContent.lastIndexOf('\n', start - 1) + 1;
      const currentLine = targetContent.slice(lineStart, start);
      const match = currentLine.match(/^(\s*)/);
      let indent = match ? match[1] : '';

      if (currentLine.trim().endsWith('{')) {
        indent += '  ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const newContent = targetContent.slice(0, start) + '\n' + indent + targetContent.slice(start);
        onUpdateContent(targetFileName, newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        }, 0);
      }
      return;
    }

    const pairMap: Record<string, string> = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
    if (pairMap[e.key]) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) {
        e.preventDefault();
        const closeChar = pairMap[e.key];
        const newContent = targetContent.slice(0, start) + e.key + closeChar + targetContent.slice(start);
        onUpdateContent(targetFileName, newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
        return;
      }
    }
  };

  const handleFormatCode = () => {
    const rawLines = activeFile.content.split('\n');
    let indentLevel = 0;
    const formatted = rawLines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('}') || trimmed.startsWith(');')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      const indentStr = '  '.repeat(indentLevel);
      const result = indentStr + trimmed;
      const opens = (trimmed.match(/{/g) || []).length;
      const closes = (trimmed.match(/}/g) || []).length;
      indentLevel = Math.max(0, indentLevel + (opens - closes));
      return result;
    }).join('\n');

    onUpdateContent(activeFile.name, formatted);
  };

  const handleInsertSnippet = (snippetCode: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onUpdateContent(activeFile.name, activeFile.content + '\n\n' + snippetCode);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = activeFile.content.slice(0, start) + '\n' + snippetCode + '\n' + activeFile.content.slice(end);
    onUpdateContent(activeFile.name, newContent);
  };

  const combinedSource = useMemo(() => {
    return generateCombinedCode(files);
  }, [files]);

  const highlightedHtml = useMemo(() => {
    return highlightCode(activeFile?.content || '');
  }, [activeFile?.content]);

  const highlightedSecHtml = useMemo(() => {
    return highlightCode(splitSecondaryFile?.content || '');
  }, [splitSecondaryFile?.content]);

  const highlightedCombinedHtml = useMemo(() => {
    return highlightCode(combinedSource);
  }, [combinedSource]);

  const handleCopyCombined = () => {
    navigator.clipboard.writeText(combinedSource);
    setCopiedCombined(true);
    setTimeout(() => setCopiedCombined(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full select-text overflow-hidden transition-colors duration-200 ${
      isOpal ? 'tornasol-ambient-opal text-slate-800' : 'tornasol-ambient-dark text-slate-100'
    }`}>
      {/* File Tabs Bar with Floating Pill Aesthetic */}
      <TabBar
        files={files}
        activeFile={activeFileName}
        onSelectFile={onSelectFile}
        onAddFile={onAddFile}
        onDeleteFile={onDeleteFile}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(!isSplitView)}
        isCombinedView={isCombinedView}
        onToggleCombinedView={() => setIsCombinedView(!isCombinedView)}
        isOpal={isOpal}
      />

      {/* Editor Sub-Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b text-xs transition-colors ${
        isOpal ? 'bg-white/50 border-purple-100' : 'bg-black/20 border-white/5'
      }`}>
        <div className="flex items-center gap-2">
          {isCombinedView ? (
            <span className="text-tornasol font-bold text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unified Translation Unit (Merged config.h + C++ source)</span>
            </span>
          ) : isSplitView ? (
            <span className="text-tornasol font-bold text-xs flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-purple-400" />
              <span>Split Studio: [{splitSecondaryFile?.name}] ⟷ [{activeFile?.name}]</span>
            </span>
          ) : (
            <>
              <span className={`font-mono text-[11px] truncate max-w-[200px] ${isOpal ? 'text-slate-600' : 'text-slate-400'}`}>
                {activeFile?.name}
              </span>
              {activeFile?.isEntry && (
                <span className="text-[10px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Entry Sketch
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCombinedView ? (
            <>
              <button
                type="button"
                onClick={handleCopyCombined}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-semibold"
              >
                {copiedCombined ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCombined ? 'Copied' : 'Copy Combined'}</span>
              </button>
              {onFlattenFiles && (
                <button
                  type="button"
                  onClick={onFlattenFiles}
                  className="btn-tornasol flex items-center gap-1 px-3 py-1 rounded-lg transition-all text-xs font-bold"
                  title="Merge config.h and C++ into single standalone main.ino"
                >
                  <Merge className="w-3.5 h-3.5" />
                  <span>Flatten into Single .ino</span>
                </button>
              )}
            </>
          ) : (
            <>
              <SnippetsMenu onInsertSnippet={handleInsertSnippet} />
              <button
                type="button"
                onClick={handleFormatCode}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors border ${
                  isOpal
                    ? 'bg-white hover:bg-purple-50 text-slate-700 border-purple-200 shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
                title="Auto-format indentation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Format</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors border ${
                  showSearch
                    ? 'bg-purple-900/40 text-purple-200 border-purple-500/40'
                    : isOpal
                    ? 'bg-white hover:bg-purple-50 text-slate-700 border-purple-200 shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
                title="Find & Replace"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Find</span>
              </button>
            </>
          )}

          {/* Font Zoom Controls */}
          <div className={`flex items-center rounded-lg px-1 border ${
            isOpal ? 'bg-white border-purple-200' : 'bg-white/5 border-white/5'
          }`}>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              className="p-1 opacity-60 hover:opacity-100"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-mono px-1 opacity-70">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              className="p-1 opacity-60 hover:opacity-100"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && !isCombinedView && (
        <div className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b text-xs ${
          isOpal ? 'bg-purple-50 border-purple-200' : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex items-center gap-1 bg-black/20 border border-white/10 rounded-lg px-2.5 py-1">
            <Search className="w-3 h-3 opacity-60" />
            <input
              type="text"
              placeholder="Find..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-36"
            />
          </div>
          <div className="flex items-center gap-1 bg-black/20 border border-white/10 rounded-lg px-2.5 py-1">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={e => setReplaceQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-36"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!searchQuery) return;
              const idx = activeFile.content.indexOf(searchQuery);
              if (idx !== -1) {
                const updated = activeFile.content.slice(0, idx) + replaceQuery + activeFile.content.slice(idx + searchQuery.length);
                onUpdateContent(activeFile.name, updated);
              }
            }}
            disabled={!searchQuery}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold"
          >
            Replace
          </button>
        </div>
      )}

      {/* Editor Content Surface */}
      <div className="relative flex-1 flex overflow-hidden font-mono" style={{ fontSize: `${fontSize}px` }}>
        {/* CASE 1: COMBINED PREPROCESSED VIEW */}
        {isCombinedView ? (
          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed select-text ${
              isOpal ? 'bg-white/70 text-slate-800' : 'bg-black/30 text-slate-200'
            }`}>
              <div className="mb-4 p-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 text-cyan-300 text-xs flex items-center justify-between">
                <span>
                  ✓ <strong>Tornasol Preprocessor:</strong> Declarations in <strong>config.h</strong> are fused with C++ routines before toolchain compilation.
                </span>
                <span className="font-mono text-[11px] opacity-70">Unified translation unit</span>
              </div>
              <pre
                className="m-0 select-text font-mono leading-6"
                dangerouslySetInnerHTML={{ __html: highlightedCombinedHtml }}
              />
            </div>
          </div>
        ) : isSplitView ? (
          /* CASE 2: SPLIT DUAL STUDIO (config.h Left, C++ Right) */
          <div className="flex-1 flex divide-x divide-white/10 overflow-hidden">
            {/* Left Header Pane */}
            <div className={`flex-1 flex flex-col min-w-0 ${isOpal ? 'bg-white/60' : 'bg-black/25'}`}>
              <div className={`flex items-center justify-between px-4 py-1.5 border-b text-[11px] font-bold ${
                isOpal ? 'bg-purple-100/60 border-purple-200 text-purple-900' : 'bg-white/5 border-white/5 text-amber-300'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Header Pane: {splitSecondaryFile?.name}</span>
                </div>
                <select
                  value={splitSecondaryFileName}
                  onChange={e => setSplitSecondaryFileName(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-md px-2 py-0.5 text-[10px]"
                >
                  {files.map(f => (
                    <option key={f.name} value={f.name} className="bg-slate-900 text-white">{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                <div
                  ref={secLineNumbersRef}
                  className="w-11 bg-transparent opacity-40 py-3 select-none overflow-hidden shrink-0 text-right pr-2 font-mono leading-6 tabular-nums"
                >
                  {secLines.map((_, idx) => (
                    <div key={idx + 1} className="h-6">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                <div className="relative flex-1 h-full overflow-hidden">
                  <pre
                    ref={secPreRef}
                    aria-hidden="true"
                    className="absolute inset-0 p-3 m-0 pointer-events-none overflow-hidden whitespace-pre font-mono leading-6 tab-4 opacity-90"
                    dangerouslySetInnerHTML={{ __html: highlightedSecHtml }}
                  />
                  <textarea
                    ref={secTextareaRef}
                    value={splitSecondaryFile?.content || ''}
                    onChange={e => onUpdateContent(splitSecondaryFile.name, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, splitSecondaryFile.name, splitSecondaryFile.content)}
                    onScroll={handleSecScroll}
                    spellCheck={false}
                    className="absolute inset-0 p-3 m-0 bg-transparent text-transparent caret-amber-400 resize-none font-mono leading-6 tab-4 focus:outline-none overflow-auto whitespace-pre selection:bg-amber-500/30 selection:text-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right C++ Implementation Pane */}
            <div className={`flex-1 flex flex-col min-w-0 ${isOpal ? 'bg-white/80' : 'bg-black/35'}`}>
              <div className={`flex items-center justify-between px-4 py-1.5 border-b text-[11px] font-bold ${
                isOpal ? 'bg-cyan-100/60 border-cyan-200 text-cyan-900' : 'bg-white/5 border-white/5 text-cyan-300'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>C++ Implementation: {activeFile?.name}</span>
                </div>
                <span className="opacity-60 text-[10px]">Active Translation Unit</span>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                <div
                  ref={lineNumbersRef}
                  className="w-11 bg-transparent opacity-40 py-3 select-none overflow-hidden shrink-0 text-right pr-2 font-mono leading-6 tabular-nums"
                >
                  {lines.map((_, idx) => (
                    <div key={idx + 1} className="h-6">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                <div className="relative flex-1 h-full overflow-hidden">
                  <pre
                    ref={preRef}
                    aria-hidden="true"
                    className="absolute inset-0 p-3 m-0 pointer-events-none overflow-hidden whitespace-pre font-mono leading-6 tab-4"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                  <textarea
                    ref={textareaRef}
                    value={activeFile?.content || ''}
                    onChange={e => onUpdateContent(activeFile.name, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, activeFile.name, activeFile.content)}
                    onScroll={handleScroll}
                    onKeyUp={handleCursorMove}
                    onClick={handleCursorMove}
                    spellCheck={false}
                    className="absolute inset-0 p-3 m-0 bg-transparent text-transparent caret-cyan-400 resize-none font-mono leading-6 tab-4 focus:outline-none overflow-auto whitespace-pre selection:bg-cyan-500/30 selection:text-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 3: STANDARD TORNASOL STUDIO */
          <>
            <div
              ref={lineNumbersRef}
              className="w-12 sm:w-14 bg-transparent border-r border-white/5 opacity-50 py-3 select-none overflow-hidden shrink-0 text-right pr-3 font-mono leading-6 tabular-nums"
            >
              {lines.map((_, idx) => {
                const lineNum = idx + 1;
                const isErrorLine = errorLine === lineNum && (!errorFile || errorFile === activeFile?.name);
                const isCurrentLine = cursorPos.line === lineNum;

                return (
                  <div
                    key={lineNum}
                    className={`relative h-6 ${
                      isErrorLine
                        ? 'text-red-400 font-bold bg-red-500/20'
                        : isCurrentLine
                        ? 'text-purple-300 font-bold'
                        : 'opacity-60'
                    }`}
                  >
                    {isErrorLine && (
                      <span className="absolute -left-1 top-1 w-1.5 h-4 bg-red-400 rounded-r" />
                    )}
                    <span>{lineNum}</span>
                  </div>
                );
              })}
            </div>

            <div className="relative flex-1 h-full overflow-hidden">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="absolute inset-0 p-3 m-0 pointer-events-none overflow-hidden whitespace-pre font-mono leading-6 tab-4"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
              <textarea
                ref={textareaRef}
                value={activeFile?.content || ''}
                onChange={e => onUpdateContent(activeFile.name, e.target.value)}
                onKeyDown={e => handleKeyDown(e, activeFile.name, activeFile.content)}
                onScroll={handleScroll}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="absolute inset-0 p-3 m-0 bg-transparent text-transparent caret-purple-400 resize-none font-mono leading-6 tab-4 focus:outline-none overflow-auto whitespace-pre selection:bg-purple-500/30 selection:text-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Editor Status Bar Footer */}
      <div className={`flex items-center justify-between px-4 py-1.5 border-t text-[11px] select-none transition-colors ${
        isOpal ? 'bg-white/60 border-purple-100 text-slate-600' : 'bg-black/30 border-white/5 text-slate-400'
      }`}>
        <div className="flex items-center gap-3">
          <span className="tabular-nums font-mono font-medium">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="text-tornasol font-bold">Tornasol C++ Engine</span>
          {files.some(f => f.name.endsWith('.h')) && (
            <span className="text-amber-400 text-[10px] hidden md:inline">
              ✨ config.h auto-linked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {errorLine && (
            <div className="flex items-center gap-1 text-red-400 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Compilation issue on Ln {errorLine}</span>
            </div>
          )}
          <span className="opacity-60 hidden md:inline">Ctrl+S to compile · Split View available</span>
        </div>
      </div>
    </div>
  );
};
