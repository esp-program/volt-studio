import React from 'react';
import { MicroBoard } from '../types/ide';
import {
  Check,
  ArrowRight,
  Terminal,
  LineChart,
  BookOpen,
  Cpu,
  Layers,
  UploadCloud,
  FileCode,
  Download,
  Usb,
  Sparkles,
  Clipboard,
  Sun,
  Moon,
  HelpCircle,
  Code2
} from 'lucide-react';

interface HeaderProps {
  boards: MicroBoard[];
  selectedBoard: MicroBoard;
  onSelectBoard: (board: MicroBoard) => void;
  comPortName: string;
  isComConnected: boolean;
  isVirtualCom: boolean;
  onConnectCom: () => void;
  onToggleVirtualCom: () => void;
  onOpenComModal: () => void;
  onOpenCombinedCode: () => void;
  onVerify: () => void;
  onUpload: () => void;
  isCompiling: boolean;
  isUploading: boolean;
  activeBottomPanel: 'console' | 'monitor' | 'plotter' | 'none';
  onToggleBottomPanel: (panel: 'console' | 'monitor' | 'plotter') => void;
  onOpenLibraries: () => void;
  onOpenGallery: () => void;
  onOpenPinout: () => void;
  onOpenPublish: () => void;
  onOpenAI: () => void;
  onOpenPasteModal: () => void;
  onExportIno: () => void;
  onNewSketch: () => void;
  themeMode: 'obsidian' | 'opal';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  boards,
  selectedBoard,
  onSelectBoard,
  comPortName,
  isComConnected,
  isVirtualCom,
  onConnectCom,
  onToggleVirtualCom,
  onOpenComModal,
  onOpenCombinedCode,
  onVerify,
  onUpload,
  isCompiling,
  isUploading,
  activeBottomPanel,
  onToggleBottomPanel,
  onOpenLibraries,
  onOpenGallery,
  onOpenPinout,
  onOpenPublish,
  onOpenAI,
  onOpenPasteModal,
  onExportIno,
  onNewSketch,
  themeMode,
  onToggleTheme
}) => {
  const isOpal = themeMode === 'opal';

  return (
    <div className={`flex flex-col select-none transition-colors duration-200 ${
      isOpal
        ? 'bg-slate-100/90 text-slate-800 border-b border-purple-200/50 backdrop-blur-xl'
        : 'bg-[#0b0f19]/85 text-slate-100 border-b border-white/10 backdrop-blur-xl'
    }`}>
      {/* Tornasol Specular Light Band */}
      <div className="h-[3px] bg-tornasol-fluid w-full shadow-[0_0_12px_rgba(179,136,255,0.6)]" />

      {/* Top Bar */}
      <header className={`flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-2.5 ${
        isOpal ? 'border-b border-purple-200/40' : 'border-b border-white/5'
      }`}>
        {/* Zone 1: Tornasol Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-wider text-tornasol">VOLT</span>
            <span className={`text-base font-light tracking-wide ${isOpal ? 'text-slate-800' : 'text-white'}`}>STUDIO</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-semibold border ${
            isOpal
              ? 'bg-purple-100/80 text-purple-700 border-purple-200'
              : 'bg-white/5 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(179,136,255,0.2)]'
          }`}>
            Tornasol OS
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium">
          <button
            type="button"
            onClick={onOpenGallery}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isOpal ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Galería Comunitaria</span>
          </button>

          <button
            type="button"
            onClick={onOpenLibraries}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isOpal ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Librerías</span>
          </button>

          <button
            type="button"
            onClick={onOpenCombinedCode}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold ${
              isOpal ? 'text-purple-700 hover:text-purple-900' : 'text-purple-300 hover:text-white'
            }`}
            title="Ver combinación de config.h y C++"
          >
            <Code2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-tornasol">Combinar config.h + C++</span>
          </button>

          <button
            type="button"
            onClick={onOpenPinout}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isOpal ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-pink-400" />
            <span>Pinout ({selectedBoard.id.includes('esp32') ? 'ESP32 DevKit' : selectedBoard.name})</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublish}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isOpal ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-300'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Publicar Código</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Tornasol Theme Toggle + VoltAI */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Mode Toggle (Obsidian Dark ⟷ Opal Pearl) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all ${
              isOpal
                ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-purple-400/40 hover:text-white'
            }`}
            title={`Cambiar a ${isOpal ? 'Tornasol Obsidian (Oscuro)' : 'Tornasol Opal Pearl (Claro)'}`}
          >
            {isOpal ? <Moon className="w-3.5 h-3.5 text-purple-600" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          {/* VoltAI Trigger */}
          <button
            type="button"
            onClick={onOpenAI}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/40 hover:border-purple-300 text-purple-200 hover:text-white shadow-[0_0_15px_rgba(179,136,255,0.25)]"
            title="Abrir Copiloto VoltAI (Gemini)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>VoltAI</span>
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={onUpload}
            disabled={isUploading || isCompiling}
            className="btn-tornasol px-4 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Subir firmware a placa física o simulador"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Flasheando...' : 'Subir (Upload)'}</span>
          </button>
        </div>
      </header>

      {/* Floating Modern Sub-Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2 text-xs ${
        isOpal ? 'bg-white/60 border-b border-purple-100' : 'bg-black/30 border-b border-white/5'
      }`}>
        {/* Left Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Verify / Compile */}
          <button
            type="button"
            onClick={onVerify}
            disabled={isCompiling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all border ${
              isOpal
                ? 'bg-white hover:bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(112,214,255,0.15)]'
            }`}
            title="Verificar y Compilar (Ctrl+Enter)"
          >
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verificar</span>
          </button>

          {/* Quick Combinar config.h + C++ */}
          <button
            type="button"
            onClick={onOpenCombinedCode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all border ${
              isOpal
                ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-white/5 hover:bg-white/10 text-pink-300 border-pink-500/30 hover:border-pink-400'
            }`}
            title="Inspeccionar cómo se combinan config.h y C++"
          >
            <Code2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Combinar (.h + C++)</span>
          </button>

          {/* Board Selector */}
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border ${
            isOpal
              ? 'bg-white border-purple-200 text-slate-800 shadow-sm'
              : 'bg-white/5 border-white/10 text-slate-200 hover:border-purple-400/40'
          }`}>
            <span className="w-2 h-2 rounded-full bg-tornasol-fluid" />
            <select
              value={selectedBoard.id}
              onChange={e => {
                const b = boards.find(item => item.id === e.target.value);
                if (b) onSelectBoard(b);
              }}
              className="bg-transparent text-xs focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[210px] truncate font-medium"
            >
              {boards.map(board => (
                <option key={board.id} value={board.id} className={isOpal ? 'bg-white text-slate-800' : 'bg-[#0f1422] text-slate-200'}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          {/* Enhanced COM Port Selector with Quick Modal Guide */}
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border ${
            isOpal
              ? 'bg-white border-purple-200 text-slate-800 shadow-sm'
              : 'bg-white/5 border-white/10 text-slate-200 hover:border-cyan-400/40'
          }`}>
            <button
              type="button"
              onClick={onOpenComModal}
              title="Gestión de Puertos COM (Reales y Virtuales)"
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
            >
              <Usb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </button>

            {isComConnected ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenComModal}
                  className={`text-xs font-mono flex items-center gap-1.5 ${
                    isVirtualCom ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                  title="Click para cambiar puerto COM o ver detalles"
                >
                  <span className={`w-2 h-2 rounded-full ${isVirtualCom ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
                  <span className="truncate max-w-[120px]">
                    {isVirtualCom ? '⚡ Virtual COM3' : `🔌 ${comPortName || 'USB COM'}`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenComModal}
                  className="hover:text-cyan-400 transition-colors font-medium text-xs flex items-center gap-1"
                >
                  <span>Puertos COM</span>
                  <HelpCircle className="w-3 h-3 text-cyan-400 opacity-80" />
                </button>
                <span className="opacity-30">|</span>
                <button
                  type="button"
                  onClick={onToggleVirtualCom}
                  className="text-amber-400 hover:underline text-[11px]"
                  title="Activar simulador virtual rápido"
                >
                  ⚡ Sim COM
                </button>
              </div>
            )}
          </div>

          {/* Direct Code Paste Action */}
          <button
            type="button"
            onClick={onOpenPasteModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors border ${
              isOpal
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Pegar código directamente (Paste Code)"
          >
            <Clipboard className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Pegar Código</span>
          </button>

          {/* Quick Sketch Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={onNewSketch}
              className={`p-1.5 rounded-lg transition-colors ${
                isOpal ? 'text-slate-500 hover:bg-purple-100 hover:text-slate-800' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Nuevo Sketch Limpio"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onExportIno}
              className={`p-1.5 rounded-lg transition-colors ${
                isOpal ? 'text-slate-500 hover:bg-purple-100 hover:text-slate-800' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Exportar archivo .ino"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Output Panel Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleBottomPanel('console')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-xs border ${
              activeBottomPanel === 'console'
                ? isOpal
                  ? 'bg-purple-200 text-purple-900 border-purple-300 font-semibold'
                  : 'bg-purple-900/40 text-purple-200 border-purple-500/40 shadow-[0_0_10px_rgba(179,136,255,0.2)]'
                : isOpal
                ? 'text-slate-600 hover:bg-purple-50 border-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Consola</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleBottomPanel('monitor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-xs border ${
              activeBottomPanel === 'monitor'
                ? isOpal
                  ? 'bg-cyan-200 text-cyan-900 border-cyan-300 font-semibold'
                  : 'bg-cyan-900/40 text-cyan-200 border-cyan-500/40 shadow-[0_0_10px_rgba(112,214,255,0.2)]'
                : isOpal
                ? 'text-slate-600 hover:bg-cyan-50 border-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Monitor Serie</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleBottomPanel('plotter')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-xs border ${
              activeBottomPanel === 'plotter'
                ? isOpal
                  ? 'bg-pink-200 text-pink-900 border-pink-300 font-semibold'
                  : 'bg-pink-900/40 text-pink-200 border-pink-500/40 shadow-[0_0_10px_rgba(255,128,191,0.2)]'
                : isOpal
                ? 'text-slate-600 hover:bg-pink-50 border-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Plotter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
