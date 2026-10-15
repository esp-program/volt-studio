import React, { useState } from 'react';
import { MicroBoard } from '../../types/ide';
import { Cpu, X, Zap, Wifi, Bluetooth, Activity, Radio, Layers, Sparkles } from 'lucide-react';

interface BoardPinoutModalProps {
  board: MicroBoard;
  isOpen: boolean;
  onClose: () => void;
  isOpal?: boolean;
}

// Detailed pin definition for ESP32 DevKit V1 (30 pins: 15 left, 15 right)
const ESP32_DEVKIT_V1_PINS = {
  left: [
    { pin: '3V3', label: 'Power 3.3V', type: 'power', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { pin: 'EN', label: 'Chip Enable (Reset)', type: 'system', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
    { pin: 'VP', label: 'GPIO36 / ADC1_CH0 (Input only)', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'VN', label: 'GPIO39 / ADC1_CH3 (Input only)', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'D34', label: 'GPIO34 / ADC1_CH6 (Input only)', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'D35', label: 'GPIO35 / ADC1_CH7 (Input only)', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'D32', label: 'GPIO32 / ADC1_CH4 / Touch9', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'D33', label: 'GPIO33 / ADC1_CH5 / Touch8', type: 'adc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { pin: 'D25', label: 'GPIO25 / DAC1 (True Analog Out)', type: 'dac', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { pin: 'D26', label: 'GPIO26 / DAC2 (True Analog Out)', type: 'dac', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { pin: 'D27', label: 'GPIO27 / ADC2_CH7 / Touch7', type: 'gpio', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { pin: 'D14', label: 'GPIO14 / HSPI_CLK / Touch6', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'D12', label: 'GPIO12 / HSPI_MISO / Touch5', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'GND', label: 'Ground 0V', type: 'ground', color: 'bg-slate-700/50 text-slate-300 border-slate-600' },
    { pin: 'D13', label: 'GPIO13 / HSPI_MOSI / Touch4', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  ],
  right: [
    { pin: 'VIN', label: 'Power 5V In (USB Rail)', type: 'power', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { pin: 'GND', label: 'Ground 0V', type: 'ground', color: 'bg-slate-700/50 text-slate-300 border-slate-600' },
    { pin: 'D15', label: 'GPIO15 / HSPI_SS / Touch3', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'D2', label: 'GPIO2 / Built-in BLUE LED / Touch2', type: 'led', color: 'bg-blue-500/30 text-blue-300 border-blue-400 font-bold' },
    { pin: 'D4', label: 'GPIO4 / ADC2_CH0 / Touch0', type: 'gpio', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { pin: 'RX2', label: 'GPIO16 / UART2_RX', type: 'uart', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { pin: 'TX2', label: 'GPIO17 / UART2_TX', type: 'uart', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { pin: 'D5', label: 'GPIO5 / VSPI_SS', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'D18', label: 'GPIO18 / VSPI_SCK', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'D19', label: 'GPIO19 / VSPI_MISO', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { pin: 'D21', label: 'GPIO21 / I2C SDA (Wire)', type: 'i2c', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-semibold' },
    { pin: 'RX0', label: 'GPIO3 / UART0_RX (USB Serial)', type: 'uart', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { pin: 'TX0', label: 'GPIO1 / UART0_TX (USB Serial)', type: 'uart', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { pin: 'D22', label: 'GPIO22 / I2C SCL (Wire)', type: 'i2c', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-semibold' },
    { pin: 'D23', label: 'GPIO23 / VSPI_MOSI', type: 'spi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  ]
};

export const BoardPinoutModal: React.FC<BoardPinoutModalProps> = ({ board, isOpen, onClose, isOpal = false }) => {
  const [selectedPin, setSelectedPin] = useState<{ pin: string; label: string; type: string } | null>(null);

  if (!isOpen) return null;

  const isEsp32 = board.id.includes('esp32');

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
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-tornasol">
                  {board.name}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                  isOpal
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                }`}>
                  {board.architecture}
                </span>
              </div>
              <p className={`text-xs ${isOpal ? 'text-slate-500' : 'text-slate-400'}`}>
                MCU: <span className="font-mono text-cyan-300">{board.mcu}</span> @ {board.clockSpeed} · Default UART: {board.defaultBaud} baud
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

        {/* Specs Overview Matrix */}
        <div className="px-6 py-3 border-b border-white/5 bg-black/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${
              isOpal ? 'bg-white border-purple-100' : 'bg-[#0f1422] border-white/10'
            }`}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Flash ROM</div>
              <div className="text-sm font-bold text-tornasol font-mono mt-0.5">
                {(board.flashBytes / 1024).toLocaleString()} KB
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isOpal ? 'bg-white border-purple-100' : 'bg-[#0f1422] border-white/10'
            }`}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">SRAM Memory</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                {(board.sramBytes / 1024).toLocaleString()} KB
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isOpal ? 'bg-white border-purple-100' : 'bg-[#0f1422] border-white/10'
            }`}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Clock Freq</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {board.clockSpeed}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isOpal ? 'bg-white border-purple-100' : 'bg-[#0f1422] border-white/10'
            }`}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Wireless & I/O</div>
              <div className="flex items-center gap-2 text-xs font-semibold mt-1">
                {board.hasWifi && <span className="flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" /> WiFi</span>}
                {board.hasBluetooth && <span className="flex items-center gap-1 text-blue-400"><Bluetooth className="w-3 h-3" /> BLE</span>}
                {!board.hasWifi && !board.hasBluetooth && <span className="text-slate-400">UART USB</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Pinout View Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Interactive ESP32 DevKit Diagram if ESP32 */}
          {isEsp32 && (
            <div className={`p-5 rounded-2xl border ${
              isOpal ? 'bg-white border-purple-200' : 'bg-[#0d121e] border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Diagrama Gráfico Interactivo: ESP32 DevKit V1 (30 Pines)
                  </h3>
                </div>
                <span className="text-[11px] text-purple-300 font-mono">
                  Haz clic en un pin para ver detalles
                </span>
              </div>

              {/* Graphical ESP32 PCB Layout */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Left Header Pins */}
                <div className="md:col-span-4 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 px-1">Conector Izquierdo</div>
                  {ESP32_DEVKIT_V1_PINS.left.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPin(p)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-xs border font-mono transition-all text-left ${p.color} hover:brightness-125 ${
                        selectedPin?.pin === p.pin ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
                      }`}
                    >
                      <span className="font-bold">{p.pin}</span>
                      <span className="text-[10px] opacity-80 truncate max-w-[170px]">{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Central Microcontroller Body */}
                <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-black/40 text-center relative overflow-hidden">
                  <div className="w-full h-8 rounded bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 border border-zinc-500 mb-3 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                    🔌 Micro-USB / Type-C (UART CP2102)
                  </div>

                  <div className="w-20 h-24 rounded-lg bg-zinc-800 border-2 border-zinc-600 shadow-inner flex flex-col items-center justify-center p-2 mb-3 relative">
                    <span className="text-[9px] font-mono text-zinc-400">ESP-WROOM-32</span>
                    <Cpu className="w-7 h-7 text-cyan-400 my-1 animate-pulse" />
                    <span className="text-[8px] font-mono text-emerald-400">Xtensa 240MHz</span>
                    {/* Antena WiFi trace */}
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400/40" />
                  </div>

                  {/* Onboard Buttons & LED */}
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 border border-zinc-600">EN (RST)</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-400 animate-pulse font-bold">
                      LED (GPIO2)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 border border-zinc-600">BOOT</span>
                  </div>
                </div>

                {/* Right Header Pins */}
                <div className="md:col-span-4 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 px-1 text-right">Conector Derecho</div>
                  {ESP32_DEVKIT_V1_PINS.right.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPin(p)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-xs border font-mono transition-all text-left ${p.color} hover:brightness-125 ${
                        selectedPin?.pin === p.pin ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
                      }`}
                    >
                      <span className="text-[10px] opacity-80 truncate max-w-[170px]">{p.label}</span>
                      <span className="font-bold">{p.pin}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pin Detail Inspector */}
              {selectedPin && (
                <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-cyan-300 font-bold text-sm">{selectedPin.pin}</span>: {selectedPin.label}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    Tipo: {selectedPin.type}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pinout Summary List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Especificaciones de Buses y Periféricos
            </h3>
            <div className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
              isOpal ? 'bg-white border-purple-200 text-slate-700' : 'bg-[#060910] border-white/10 text-slate-300'
            }`}>
              {board.pinoutSummary.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${
          isOpal ? 'border-purple-200 bg-white/70' : 'border-white/10 bg-black/40'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Digital GPIO: {board.digitalPins} pins · ADC: {board.analogPins} canales</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-tornasol px-4 py-1.5 rounded-lg text-xs"
          >
            Cerrar Pinout
          </button>
        </div>
      </div>
    </div>
  );
};
