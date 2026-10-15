import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, ArrowDownCircle, Clock, Zap, Cpu, AlertTriangle, Usb, HelpCircle } from 'lucide-react';
import { SerialLogEntry } from '../../types/ide';

interface SerialMonitorProps {
  logs: SerialLogEntry[];
  isConnected: boolean;
  portName: string;
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  onSendMessage: (msg: string, lineEnding: 'none' | 'nl' | 'cr' | 'nl_cr') => void;
  onClearLogs: () => void;
  onToggleConnect: () => void;
  isVirtual: boolean;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000];

export const SerialMonitor: React.FC<SerialMonitorProps> = ({
  logs,
  isConnected,
  portName,
  baudRate,
  onBaudRateChange,
  onSendMessage,
  onClearLogs,
  onToggleConnect,
  isVirtual
}) => {
  const [inputVal, setInputVal] = useState('');
  const [lineEnding, setLineEnding] = useState<'none' | 'nl' | 'cr' | 'nl_cr'>('nl');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() && lineEnding === 'none') return;
    onSendMessage(inputVal, lineEnding);
    setInputVal('');
  };

  const handleQuickCmd = (cmd: string) => {
    onSendMessage(cmd, lineEnding);
  };

  return (
    <div className="flex flex-col h-full bg-[#080c14]/95 text-slate-200 select-text font-mono text-xs backdrop-blur-xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Connection Status Badge & Modal Trigger */}
          <button
            type="button"
            onClick={onToggleConnect}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
              isConnected
                ? isVirtual
                  ? 'bg-amber-950/60 text-amber-200 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-emerald-950/60 text-emerald-200 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-cyan-400/40 hover:text-white'
            }`}
            title="Abrir gestor de puertos COM (Reales y Virtuales)"
          >
            <span className={`w-2 h-2 rounded-full ${
              isConnected
                ? isVirtual
                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                : 'bg-slate-500'
            }`} />
            <span>
              {isConnected
                ? isVirtual
                  ? '⚡ COM Virtual (Simulador)'
                  : `🔌 ${portName || 'COM Real USB'}`
                : '🔌 Conectar Puerto COM...'}
            </span>
          </button>

          {/* Baud Rate Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-400">Baud:</span>
            <select
              value={baudRate}
              onChange={e => onBaudRateChange(Number(e.target.value))}
              disabled={isConnected}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {BAUD_RATES.map(rate => (
                <option key={rate} value={rate} className="bg-[#101522] text-slate-200">
                  {rate} baud
                </option>
              ))}
            </select>
          </div>

          {/* Line Ending Selector */}
          <select
            value={lineEnding}
            onChange={e => setLineEnding(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="nl" className="bg-[#101522]">Nueva línea (NL)</option>
            <option value="cr" className="bg-[#101522]">Retorno de carro (CR)</option>
            <option value="nl_cr" className="bg-[#101522]">Ambos NL & CR</option>
            <option value="none" className="bg-[#101522]">Sin fin de línea</option>
          </select>

          {/* Quick command buttons */}
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-white/10">
            {['LED_ON', 'LED_OFF', 'STATUS', 'PING'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleQuickCmd(c)}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition-colors"
                title={`Enviar '${c}'`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors border ${
              autoScroll ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Autoscroll</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTimestamp(!showTimestamp)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors border ${
              showTimestamp ? 'bg-purple-950/60 text-purple-300 border-purple-500/40' : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timestamp</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Limpiar logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed Output Area */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 select-none py-8">
            <Zap className="w-6 h-6 text-slate-600 mb-2" />
            <p>El Monitor Serie está esperando datos UART...</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Conecta tu ESP32 DevKit o Arduino mediante USB o pulsa '⚡ COM Virtual' para iniciar la simulación.
            </p>
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className={`flex items-start gap-2 py-0.5 leading-relaxed ${
                log.direction === 'out'
                  ? 'text-cyan-400'
                  : log.direction === 'system'
                  ? 'text-purple-400 font-semibold italic'
                  : 'text-slate-200'
              }`}
            >
              {showTimestamp && (
                <span className="text-[10px] text-slate-600 shrink-0 select-none">
                  [{log.timestamp}]
                </span>
              )}
              <span className="select-none opacity-50 shrink-0 font-bold">
                {log.direction === 'out' ? '>>>' : log.direction === 'system' ? '###' : '<<<'}
              </span>
              <span className="whitespace-pre-wrap break-all">{log.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Send Input Bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-2 bg-black/50 border-t border-white/5">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder={isConnected ? "Escribe un comando (ej. LED_ON, PING, STATUS)..." : "Conecta un puerto COM para transmitir..."}
          disabled={!isConnected}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputVal.trim()}
          className="btn-tornasol px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
