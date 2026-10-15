import React, { useState, useMemo } from 'react';
import { SketchFile, MicroBoard } from '../../types/ide';
import { generateCombinedCode } from '../../utils/compiler';
import { highlightCode } from '../../utils/codeHighlighter';
import {
  FileCode,
  Copy,
  Check,
  Download,
  X,
  Layers,
  ArrowRight,
  Code2,
  Cpu,
  Sparkles,
  Link2
} from 'lucide-react';

interface CombinedCodeModalProps {
  files: SketchFile[];
  board: MicroBoard;
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  isOpal?: boolean;
}

export const CombinedCodeModal: React.FC<CombinedCodeModalProps> = ({
  files,
  board,
  isOpen,
  onClose,
  onVerify,
  isOpal = false
}) => {
  const [activeTab, setActiveTab] = useState<'combined' | 'symbols' | 'guide'>('combined');
  const [copied, setCopied] = useState(false);

  // Generate combined single translation unit
  const combinedCode = useMemo(() => {
    return generateCombinedCode(files);
  }, [files]);

  // Extract config.h symbols and where they are used
  const symbolAnalysis = useMemo(() => {
    const configHeader = files.find(f => f.name.toLowerCase().includes('config.h'));
    const entryFile = files.find(f => f.isEntry) || files[0];

    const symbols: { name: string; value: string; type: 'macro' | 'prototype' | 'const'; foundInSketch: boolean }[] = [];

    if (configHeader) {
      const lines = configHeader.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Match #define NAME VALUE
        const defineMatch = trimmed.match(/^#define\s+([a-zA-Z0-9_]+)(?:\s+(.+))?$/);
        if (defineMatch) {
          const name = defineMatch[1];
          if (name !== 'CONFIG_H' && !name.endsWith('_H')) {
            const value = (defineMatch[2] || 'defined').replace(/\/\/.*$/, '').trim();
            const foundInSketch = entryFile ? new RegExp(`\\b${name}\\b`).test(entryFile.content) : false;
            symbols.push({ name, value, type: 'macro', foundInSketch });
          }
        }

        // Match function prototypes
        const protoMatch = trimmed.match(/^(?:void|int|bool|float|String)\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*;/);
        if (protoMatch) {
          const name = protoMatch[1];
          const foundInSketch = entryFile ? new RegExp(`\\b${name}\\b`).test(entryFile.content) : false;
          symbols.push({ name, value: trimmed, type: 'prototype', foundInSketch });
        }
      }
    }

    return { configHeader, entryFile, symbols };
  }, [files]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(combinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([combinedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.id}_combined_firmware.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
        isOpal
          ? 'bg-slate-50/95 border-purple-200 text-slate-900 shadow-purple-500/10'
          : 'bg-[#0a0e17]/95 border-purple-500/30 text-slate-100 shadow-[0_0_50px_rgba(179,136,255,0.15)]'
      }`}>
        {/* Specular Light Strip */}
        <div className="h-[3px] bg-tornasol-fluid w-full" />

        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isOpal ? 'border-purple-200/60 bg-white/50' : 'border-white/10 bg-black/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tornasol-fluid p-[1px] shadow-sm">
              <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${
                isOpal ? 'bg-white' : 'bg-[#0a0e17]'
              }`}>
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-tornasol">
                  Combinación de Código: config.h y C++
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                  isOpal
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                }`}>
                  Unidad de Traducción
                </span>
              </div>
              <p className={`text-xs ${isOpal ? 'text-slate-500' : 'text-slate-400'}`}>
                Visualiza cómo el preprocesador y compilador vinculan encabezados (.h) con el código C++ (.ino / .cpp)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isOpal ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between gap-4 border-b ${
          isOpal ? 'bg-purple-50/80 border-purple-100 text-purple-900' : 'bg-purple-950/20 border-white/5 text-purple-200'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Preprocesador VoltIDE:</strong> Los archivos <code className="font-mono text-cyan-400">config.h</code> se inyectan directamente en el espacio de nombres de <code className="font-mono text-pink-400">main.ino</code>, permitiendo usar macros y constantes sin duplicación de memoria.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : isOpal
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-white/5 text-slate-200 border-white/10 hover:border-cyan-400/40 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Combinado'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-tornasol px-3 py-1 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .ino</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-2 px-6 pt-3 border-b ${
          isOpal ? 'border-purple-200/40 bg-slate-100/50' : 'border-white/5 bg-black/10'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'combined'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código Unificado Preprocesado ({files.length} archivos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('symbols')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'symbols'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Símbolos Vinculados config.h ⟷ C++ ({symbolAnalysis.symbols.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-pink-400 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>¿Cómo se combinan en el IDE?</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs">
          {activeTab === 'combined' && (
            <div className={`p-4 rounded-xl border overflow-x-auto ${
              isOpal ? 'bg-white border-purple-200 text-slate-800' : 'bg-[#060910] border-white/10 text-slate-200'
            }`}>
              <pre className="whitespace-pre font-mono leading-relaxed">
                {combinedCode.split('\n').map((line, idx) => (
                  <div key={idx} className="hover:bg-white/5 px-2 py-0.5 rounded">
                    <span className="inline-block w-8 text-right mr-4 text-slate-500 select-none">
                      {idx + 1}
                    </span>
                    {highlightCode(line)}
                  </div>
                ))}
              </pre>
            </div>
          )}

          {activeTab === 'symbols' && (
            <div className="space-y-4 font-sans text-xs">
              <div className={`p-4 rounded-xl border ${
                isOpal ? 'bg-white border-purple-200' : 'bg-[#080d17] border-white/10'
              }`}>
                <h3 className="font-bold text-sm text-tornasol mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  Mapeo de Macros y Símbolos de config.h
                </h3>
                <p className="text-slate-400 mb-4">
                  El preprocesador de VoltIDE escanea automáticamente <code className="text-cyan-300 font-mono">config.h</code> y verifica que las directivas y pines estén referenciados en <code className="text-pink-300 font-mono">main.ino</code>:
                </p>

                {symbolAnalysis.symbols.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-white/5 rounded-lg border border-white/5 font-mono">
                    No se detectaron directivas #define en config.h aún. Agrega macros como #define LED_PIN 2 para vincularlas.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-[11px] uppercase tracking-wider ${
                          isOpal ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'
                        }`}>
                          <th className="py-2 px-3">Símbolo (Macro)</th>
                          <th className="py-2 px-3">Valor / Declaración</th>
                          <th className="py-2 px-3">Tipo</th>
                          <th className="py-2 px-3">Estado de Enlace</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {symbolAnalysis.symbols.map((sym, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="py-2 px-3 font-bold text-cyan-400">{sym.name}</td>
                            <td className="py-2 px-3 text-amber-300 truncate max-w-xs">{sym.value}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300 uppercase">
                                {sym.type}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              {sym.foundInSketch ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <Check className="w-3.5 h-3.5" /> Vinculado en main.ino
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                                  Declarado pero no usado
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 font-sans text-xs">
              <div className={`p-5 rounded-xl border leading-relaxed ${
                isOpal ? 'bg-white border-purple-200 text-slate-700' : 'bg-[#080d17] border-white/10 text-slate-300'
              }`}>
                <h3 className="text-sm font-bold text-tornasol mb-2">
                  ¿Cómo se combinan config.h y C++ en el IDE?
                </h3>
                <p className="mb-3">
                  En los entornos de desarrollo para microcontroladores (como Arduino IDE, PlatformIO o VoltIDE), el código modular se divide habitualmente en:
                </p>

                <ol className="list-decimal pl-5 space-y-2 mb-4">
                  <li>
                    <strong className="text-cyan-400">config.h (Encabezado de Configuración):</strong> Contiene directivas del preprocesador (<code className="font-mono text-amber-300">#define</code>), constantes (<code className="font-mono text-amber-300">const int</code>), estructuras y prototipos de funciones. Protegido con <code className="font-mono text-purple-300">#ifndef CONFIG_H / #define CONFIG_H / #endif</code> para evitar inclusiones recursivas.
                  </li>
                  <li>
                    <strong className="text-pink-400">main.ino / main.cpp (Archivo Principal):</strong> Incluye el encabezado con <code className="font-mono text-cyan-300">#include "config.h"</code>. Antes de que el compilador C++ (g++/avr-gcc/xtensa-esp32-elf-gcc) compile, el <em>preprocesador</em> reemplaza automáticamente cada macro por su valor.
                  </li>
                  <li>
                    <strong className="text-purple-400">Unidad de Traducción Unificada:</strong> El IDE fusiona los módulos en un único flujo de código binario optimizado con flags <code className="font-mono">-Os</code> (optimización de tamaño) para ajustarse a los {Math.round(board.flashBytes / 1024)} KB de memoria Flash de tu {board.name}.
                  </li>
                </ol>

                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200">
                  💡 <strong>Ventaja en VoltIDE:</strong> Puedes editar <code className="font-mono">config.h</code> y <code className="font-mono">main.ino</code> en pestañas separadas y ver al instante en esta pantalla el código combinado final, copiarlo para compartirlo en foros o enviarlo a simular en Wokwi o ESPHome.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${
          isOpal ? 'border-purple-200 bg-white/70' : 'border-white/10 bg-black/40'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Objetivo: {board.name} ({board.mcu})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isOpal ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onVerify();
              }}
              className="btn-tornasol px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Compilar Unidad Combinada</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
