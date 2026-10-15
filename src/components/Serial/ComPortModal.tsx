import React, { useState } from 'react';
import {
  Usb,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Radio,
  Send,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { serialManager } from '../../utils/webSerial';

interface ComPortModalProps {
  isOpen: boolean;
  onClose: () => void;
  isComConnected: boolean;
  isVirtualCom: boolean;
  comPortName: string;
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  onConnectPhysical: () => Promise<void>;
  onToggleVirtual: () => void;
  onSendMessage: (msg: string) => void;
  isOpal?: boolean;
}

const COMMON_BAUDS = [9600, 19200, 38400, 57600, 74880, 115200, 230400, 921600];

export const ComPortModal: React.FC<ComPortModalProps> = ({
  isOpen,
  onClose,
  isComConnected,
  isVirtualCom,
  comPortName,
  baudRate,
  onBaudRateChange,
  onConnectPhysical,
  onToggleVirtual,
  onSendMessage,
  isOpal = false
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'faq'>('manage');
  const [connectingPhysical, setConnectingPhysical] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isWebSerialSupported = serialManager.isWebSerialSupported();

  const handlePhysicalClick = async () => {
    setConnectingPhysical(true);
    setStatusMessage('Abriendo diálogo del sistema operativo para seleccionar puerto USB...');
    try {
      await onConnectPhysical();
      setStatusMessage('¡Conexión establecida con el microcontrolador físico!');
    } catch (err: any) {
      setStatusMessage(err?.message || 'No se seleccionó ningún puerto o se canceló.');
    } finally {
      setConnectingPhysical(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
        isOpal
          ? 'bg-slate-50/95 border-purple-200 text-slate-900 shadow-purple-500/10'
          : 'bg-[#0a0e17]/95 border-purple-500/30 text-slate-100 shadow-[0_0_50px_rgba(179,136,255,0.15)]'
      }`}>
        {/* Specular Light Strip */}
        <div className="h-[3px] bg-tornasol-fluid w-full" />

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isOpal ? 'border-purple-200/60 bg-white/50' : 'border-white/10 bg-black/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tornasol-fluid p-[1px] shadow-sm">
              <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${
                isOpal ? 'bg-white' : 'bg-[#0a0e17]'
              }`}>
                <Usb className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-tornasol">
                  Puertos COM: Reales y Virtuales
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                  isComConnected
                    ? isVirtualCom
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {isComConnected ? (isVirtualCom ? '⚡ Virtual COM Activo' : '🔌 COM Físico Conectado') : '⚪ Desconectado'}
                </span>
              </div>
              <p className={`text-xs ${isOpal ? 'text-slate-500' : 'text-slate-400'}`}>
                VoltIDE soporta comunicación serie bidireccional física por USB y emulación virtual interactiva
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

        {/* Tab switcher */}
        <div className={`flex items-center gap-2 px-6 pt-3 border-b ${
          isOpal ? 'border-purple-200/40 bg-slate-100/50' : 'border-white/5 bg-black/10'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'manage'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Gestión y Selección de Puerto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'faq'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>¿Son reales o virtuales? (Explicación técnica)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {activeTab === 'manage' && (
            <>
              {/* Direct Answer Alert */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isOpal ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
              }`}>
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm text-tornasol">
                    ¿Los puertos COM son reales o virtuales?
                  </div>
                  <p>
                    <strong>¡VoltIDE incluye ambos!</strong> Puedes conectar tu microcontrolador físico mediante cable USB para comunicación real por hardware, o bien activar el simulador virtual integrado si no tienes la placa conectada.
                  </p>
                </div>
              </div>

              {/* Two Option Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Puerto Real */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  !isVirtualCom && isComConnected
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : isOpal ? 'bg-white border-slate-200' : 'bg-[#0e1422] border-white/10'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          🔌
                        </div>
                        <h3 className="font-bold text-sm text-white">Puerto COM REAL (Físico)</h3>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isWebSerialSupported
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                      }`}>
                        {isWebSerialSupported ? 'WebSerial OK' : 'No soportado'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Conecta directamente tu placa real por cable USB (ESP32 DevKit, Arduino Uno, Nano, RP2040, STM32). Lee y escribe datos UART reales desde tu navegador a través de la Web Serial API nativa.
                    </p>

                    <div className="text-[11px] space-y-1 text-slate-400 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <div>✓ Drivers: CP2102, CH340, FTDI, CDC</div>
                      <div>✓ Velocidades: hasta 921600 baud</div>
                      <div>✓ Envío y recepción UART directa</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Velocidad Baud:</span>
                      <select
                        value={baudRate}
                        onChange={e => onBaudRateChange(Number(e.target.value))}
                        disabled={isComConnected}
                        className={`text-xs px-2 py-1 rounded border font-mono ${
                          isOpal ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/5 text-slate-200 border-white/10'
                        }`}
                      >
                        {COMMON_BAUDS.map(b => (
                          <option key={b} value={b} className="bg-[#101522]">{b} baud</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handlePhysicalClick}
                      disabled={connectingPhysical || !isWebSerialSupported}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        !isVirtualCom && isComConnected
                          ? 'bg-rose-600/80 hover:bg-rose-600 text-white shadow-lg'
                          : 'btn-tornasol'
                      } disabled:opacity-50`}
                    >
                      {connectingPhysical ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Buscando dispositivo USB...</span>
                        </>
                      ) : !isVirtualCom && isComConnected ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Desconectar {comPortName || 'COM Real'}</span>
                        </>
                      ) : (
                        <>
                          <Usb className="w-3.5 h-3.5" />
                          <span>Conectar Dispositivo Real (USB)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option 2: Puerto Virtual */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isVirtualCom && isComConnected
                    ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : isOpal ? 'bg-white border-slate-200' : 'bg-[#0e1422] border-white/10'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          ⚡
                        </div>
                        <h3 className="font-bold text-sm text-white">Puerto COM VIRTUAL (Simulador)</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-amber-950/60 text-amber-300 border-amber-500/40">
                        100% Integrado
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Emula un microcontrolador ESP32 DevKit en tiempo real sin cables ni hardware físico. Genera ondas de telemetría para el Serial Plotter y responde a comandos como <code className="text-cyan-300">LED_ON</code>, <code className="text-cyan-300">STATUS</code> o <code className="text-cyan-300">PING</code>.
                    </p>

                    <div className="text-[11px] space-y-1 text-slate-400 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <div>✓ No requiere cables ni hardware</div>
                      <div>✓ Simula estado de LED Pin 13 / GPIO 2</div>
                      <div>✓ Telemetría en tiempo real para Plotter</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Simulador:</span>
                      <span className="text-amber-400 font-mono">ESP32 DevKit Virtual Engine</span>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleVirtual}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isVirtualCom && isComConnected
                          ? 'bg-amber-600/80 hover:bg-amber-600 text-white shadow-lg'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isVirtualCom && isComConnected ? 'Detener Simulador Virtual' : 'Iniciar Simulador Virtual'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status or Diagnostic message */}
              {statusMessage && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Quick interactive commands */}
              {isComConnected && (
                <div className={`p-4 rounded-xl border ${
                  isOpal ? 'bg-white border-purple-200' : 'bg-black/30 border-white/10'
                }`}>
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Probar comandos rápidos en el puerto actual:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['LED_ON', 'LED_OFF', 'STATUS', 'PING', 'HELP'].map(cmd => (
                      <button
                        key={cmd}
                        type="button"
                        onClick={() => onSendMessage(cmd)}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-sans">
              <div className={`p-4 rounded-xl border ${
                isOpal ? 'bg-white border-purple-200 text-slate-800' : 'bg-[#0e1422] border-white/10'
              }`}>
                <h4 className="font-bold text-sm text-cyan-400 mb-2">1. ¿Qué es un puerto COM REAL en VoltIDE?</h4>
                <p>
                  Es una conexión directa por hardware a través del estándar oficial <strong>Web Serial API</strong> del navegador W3C. Cuando conectas tu <strong>ESP32 DevKit</strong>, Arduino Uno, Nano, Raspberry Pi Pico o placa STM32 con un cable USB a tu PC, tu sistema operativo (Windows, Linux, macOS) le asigna un puerto serie (ejemplo: <code className="text-pink-400 font-mono">COM3</code>, <code className="text-pink-400 font-mono">/dev/ttyUSB0</code>).
                </p>
                <p className="mt-2">
                  Al presionar <strong>"Conectar Dispositivo Real"</strong>, Chrome/Edge muestra el selector nativo del sistema operativo donde seleccionas el chip convertidor USB-UART (como <em>CP2102</em>, <em>CH340</em>, <em>FTDI FT232R</em> o el <em>USB CDC Nativo del ESP32-S3</em>). La comunicación, logs y gráficos en pantalla corresponden al microcontrolador físico real.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isOpal ? 'bg-white border-purple-200 text-slate-800' : 'bg-[#0e1422] border-white/10'
              }`}>
                <h4 className="font-bold text-sm text-amber-400 mb-2">2. ¿Qué es un puerto COM VIRTUAL?</h4>
                <p>
                  Es un motor emulador de microcontrolador implementado en JavaScript/TypeScript dentro de VoltIDE. Ejecuta un bucle virtual similar a <code className="text-cyan-400 font-mono">loop()</code>, genera datos periódicos de sensores (simulando lecturas analógicas de temperatura, luz y potenciómetros) y emula el estado lógico de los pines de salida como el LED (GPIO 2 o Pin 13).
                </p>
                <p className="mt-2">
                  Es ideal para:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Programar mientras viajas o si no tienes un cable USB a mano.</li>
                  <li>Probar sketches en tablets, Chromebooks o navegadores donde el acceso a hardware USB esté restringido.</li>
                  <li>Verificar que el Serial Plotter dibuje gráficos antes de conectar cables físicos.</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border ${
                isOpal ? 'bg-white border-purple-200 text-slate-800' : 'bg-[#0e1422] border-white/10'
              }`}>
                <h4 className="font-bold text-sm text-purple-400 mb-2">3. ¿Cómo sé cuál estoy usando?</h4>
                <p>
                  En la barra superior de VoltIDE y en el Monitor Serie verás siempre el indicador:
                </p>
                <div className="flex flex-wrap gap-2 mt-2 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                    🔌 COM3 (Hardware Real USB)
                  </span>
                  <span className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    ⚡ Virtual COM3 (Simulador)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${
          isOpal ? 'border-purple-200 bg-white/70' : 'border-white/10 bg-black/40'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>WebSerial API: {isWebSerialSupported ? 'Nativo en Navegador' : 'Requiere Chrome/Edge/Opera'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-tornasol px-4 py-1.5 rounded-lg text-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
