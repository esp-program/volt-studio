import React from 'react';
import { MicroBoard } from '../types/ide';
import { Cpu, RotateCcw, Zap, Sparkles, Usb } from 'lucide-react';

interface HardwareSimulatorProps {
  board: MicroBoard;
  ledPinState: boolean;
  isConnected: boolean;
  isVirtual: boolean;
  onReset: () => void;
  isOpal?: boolean;
}

export const HardwareSimulator: React.FC<HardwareSimulatorProps> = ({
  board,
  ledPinState,
  isConnected,
  isVirtual,
  onReset,
  isOpal = false
}) => {
  const isEsp32 = board.id.includes('esp32');
  const ledName = isEsp32 ? 'GPIO 2 (Blue LED)' : 'Pin 13 LED';

  return (
    <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-1.5 text-xs select-none transition-colors duration-200 border-b ${
      isOpal
        ? 'bg-purple-50/70 border-purple-200/60 text-slate-700'
        : 'bg-[#090d16]/70 border-white/5 text-slate-300'
    }`}>
      {/* Board & MCU Architecture */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-tornasol-fluid p-[1px] shadow-sm">
            <div className={`w-full h-full rounded-[5px] flex items-center justify-center ${
              isOpal ? 'bg-white' : 'bg-[#090d16]'
            }`}>
              <Cpu className="w-3 h-3 text-cyan-400" />
            </div>
          </div>
          <span className={`font-bold ${isOpal ? 'text-slate-900' : 'text-white'}`}>{board.name}</span>
          <span className={`text-[11px] font-mono ${isOpal ? 'text-purple-600' : 'text-purple-300'}`}>
            ({board.clockSpeed} · {board.architecture})
          </span>
        </div>

        <div className={`h-3 w-px ${isOpal ? 'bg-purple-200' : 'bg-white/10'}`} />

        {/* Dynamic Onboard LED (GPIO 2 on ESP32, Pin 13 on AVR) */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] ${isOpal ? 'text-slate-500' : 'text-slate-400'}`}>{ledName}:</span>
          <div
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              ledPinState
                ? isEsp32
                  ? 'bg-blue-400 shadow-[0_0_12px_#60a5fa]'
                  : 'bg-amber-300 shadow-[0_0_12px_#fde047]'
                : isOpal ? 'bg-slate-300' : 'bg-slate-700'
            }`}
            title={ledPinState ? 'HIGH' : 'LOW'}
          />
          <span className="text-[10px] font-mono font-bold">
            {ledPinState ? (
              <span className={isEsp32 ? 'text-blue-400' : 'text-amber-400'}>HIGH</span>
            ) : (
              <span className="opacity-50">LOW</span>
            )}
          </span>
        </div>

        <div className={`h-3 w-px hidden sm:block ${isOpal ? 'bg-purple-200' : 'bg-white/10'}`} />

        {/* Real vs Virtual Status Banner */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono">
          {isConnected ? (
            isVirtual ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3 h-3" /> COM Virtual (Simulador Activo)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Usb className="w-3 h-3" /> COM Real USB (WebSerial Activo)
              </span>
            )
          ) : (
            <span className="text-slate-500">COM Desconectado</span>
          )}
        </div>

        <div className={`h-3 w-px hidden lg:block ${isOpal ? 'bg-purple-200' : 'bg-white/10'}`} />

        {/* Power Rail Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">3.3V / 5.0V Rail Nominal</span>
        </div>
      </div>

      {/* Hardware Reset Action */}
      {isConnected && (
        <button
          type="button"
          onClick={onReset}
          className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md transition-all border ${
            isOpal
              ? 'bg-white hover:bg-purple-100 text-purple-700 border-purple-200'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Disparar reinicio del microcontrolador (RST / EN)"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>Reset MCU (EN)</span>
        </button>
      )}
    </div>
  );
};
