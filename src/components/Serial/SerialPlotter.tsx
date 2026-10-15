import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Trash2, LineChart, Cpu } from 'lucide-react';
import { SerialLogEntry } from '../../types/ide';

interface SerialPlotterProps {
  logs: SerialLogEntry[];
  isConnected: boolean;
  onClearLogs: () => void;
}

interface ChannelData {
  name: string;
  color: string;
  points: number[];
  latestVal: number;
}

const PALETTE = [
  '#70d6ff', // tornasol cyan
  '#b388ff', // tornasol lavender/purple
  '#ff80bf', // tornasol prismatic pink
  '#ffd166', // tornasol sunlight gold
  '#06d6a0', // tornasol mint emerald
  '#38bdf8'  // tornasol sky blue
];

export const SerialPlotter: React.FC<SerialPlotterProps> = ({ logs, isConnected, onClearLogs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [channels, setChannels] = useState<Map<string, ChannelData>>(new Map());
  const maxPoints = 80;

  // Process incoming serial logs into channels
  useEffect(() => {
    if (isPaused) return;

    const newChannels = new Map<string, ChannelData>(channels);

    // Look at recent incoming logs
    logs.slice(-5).forEach(log => {
      if (log.direction === 'system') return;
      const text = log.text.trim();
      if (!text) return;

      // Case 1: Labelled format "Label1:123,Label2:456"
      if (text.includes(':')) {
        const pairs = text.split(/[,;\t]/);
        pairs.forEach(pair => {
          const parts = pair.split(':');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const val = parseFloat(parts[1].trim());
            if (!isNaN(val)) {
              if (!newChannels.has(key)) {
                const color = PALETTE[newChannels.size % PALETTE.length];
                newChannels.set(key, { name: key, color, points: [], latestVal: val });
              }
              const ch = newChannels.get(key)!;
              ch.points.push(val);
              if (ch.points.length > maxPoints) ch.points.shift();
              ch.latestVal = val;
            }
          }
        });
      }
      // Case 2: Comma or tab separated numbers "123, 456, 789"
      else {
        const nums = text.split(/[,;\t\s]+/).map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
        nums.forEach((val, idx) => {
          const key = `Channel ${idx + 1}`;
          if (!newChannels.has(key)) {
            const color = PALETTE[newChannels.size % PALETTE.length];
            newChannels.set(key, { name: key, color, points: [], latestVal: val });
          }
          const ch = newChannels.get(key)!;
          ch.points.push(val);
          if (ch.points.length > maxPoints) ch.points.shift();
          ch.latestVal = val;
        });
      }
    });

    setChannels(new Map(newChannels));
  }, [logs, isPaused]);

  // Render canvas frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d13';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#1e2633';
    ctx.lineWidth = 1;
    const gridYSteps = 5;
    for (let i = 1; i < gridYSteps; i++) {
      const y = (height / gridYSteps) * i;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (channels.size === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting numeric telemetry data on Serial...', width / 2, height / 2);
      return;
    }

    // Find min and max across all channels for autoscaling
    let minVal = Infinity;
    let maxVal = -Infinity;

    channels.forEach(ch => {
      ch.points.forEach(p => {
        if (p < minVal) minVal = p;
        if (p > maxVal) maxVal = p;
      });
    });

    if (minVal === Infinity || maxVal === -Infinity || minVal === maxVal) {
      minVal = 0;
      maxVal = 1000;
    }

    // Add padding to range
    const range = maxVal - minVal || 1;
    const padding = range * 0.1;
    const effectiveMin = minVal - padding;
    const effectiveMax = maxVal + padding;
    const effectiveRange = effectiveMax - effectiveMin;

    // Draw Y-axis scale labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(effectiveMax.toFixed(1), 5, 15);
    ctx.fillText(((effectiveMax + effectiveMin) / 2).toFixed(1), 5, height / 2);
    ctx.fillText(effectiveMin.toFixed(1), 5, height - 8);

    // Draw waveforms for each channel
    const plotWidth = width - 45;
    const offsetX = 40;

    channels.forEach(ch => {
      if (ch.points.length < 2) return;

      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const stepX = plotWidth / (maxPoints - 1);

      ch.points.forEach((val, idx) => {
        const x = offsetX + (maxPoints - ch.points.length + idx) * stepX;
        const normalizedY = (val - effectiveMin) / effectiveRange;
        const y = height - (normalizedY * height);

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw point on current value
      const lastX = offsetX + (maxPoints - 1) * stepX;
      const lastNormalizedY = (ch.latestVal - effectiveMin) / effectiveRange;
      const lastY = height - (lastNormalizedY * height);

      ctx.fillStyle = ch.color;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [channels]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 select-none">
      {/* Plotter Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-white">Serial Plotter (Real-Time Oscilloscope)</span>
          {isConnected && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Stream
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              isPaused
                ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40'
                : 'bg-[#21262d] text-slate-300 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChannels(new Map());
              onClearLogs();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#21262d] hover:bg-red-950/60 hover:text-red-300 text-slate-400 rounded text-xs transition-colors"
            title="Reset plotter data"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Plotter Canvas Area */}
      <div className="flex-1 relative p-2 min-h-[180px] bg-[#090d13]">
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          className="w-full h-full block rounded bg-[#090d13]"
        />
      </div>

      {/* Channel Legend & Value Telemetry */}
      <div className="flex items-center gap-4 px-4 py-2 bg-[#161b22] border-t border-[#30363d] text-xs overflow-x-auto">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Channels:</span>
        {channels.size === 0 ? (
          <span className="text-slate-500 text-[11px]">No active telemetry detected</span>
        ) : (
          Array.from(channels.values()).map(ch => (
            <div key={ch.name} className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: ch.color }}
              />
              <span className="text-slate-300 font-medium">{ch.name}:</span>
              <span className="font-mono text-white tabular-nums">{ch.latestVal}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
