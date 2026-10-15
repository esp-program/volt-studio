import React, { useState, useEffect, useCallback } from 'react';
import { MicroBoard, ArduinoLibrary, SketchFile, CompilationResult, CommunitySketch, SerialLogEntry } from './types/ide';
import { SUPPORTED_BOARDS } from './data/boards';
import { INITIAL_LIBRARIES } from './data/libraries';
import { INITIAL_COMMUNITY_SKETCHES } from './data/communitySketches';
import { compileSketch, generateCombinedCode } from './utils/compiler';
import { serialManager } from './utils/webSerial';
import { Header } from './components/Header';
import { CodeEditor } from './components/Editor/CodeEditor';
import { LibraryManager } from './components/Sidebar/LibraryManager';
import { BoardPinoutModal } from './components/Sidebar/BoardPinoutModal';
import { SerialMonitor } from './components/Serial/SerialMonitor';
import { SerialPlotter } from './components/Serial/SerialPlotter';
import { OutputConsole } from './components/Console/OutputConsole';
import { CommunityGallery } from './components/Gallery/CommunityGallery';
import { PublishModal } from './components/Gallery/PublishModal';
import { HardwareSimulator } from './components/HardwareSimulator';
import { VoltAICopilot } from './components/AI/VoltAICopilot';
import { PasteCodeModal } from './components/Editor/PasteCodeModal';
import { CombinedCodeModal } from './components/Editor/CombinedCodeModal';
import { ComPortModal } from './components/Serial/ComPortModal';

const DEFAULT_SKETCH: SketchFile[] = [
  {
    name: 'main.ino',
    isEntry: true,
    content: `// ==========================================================
// VoltIDE Universal Microcontroller Studio
// Placa por defecto: ESP32 DevKit V1 (Xtensa LX6 240MHz)
// Combina automáticamente config.h con este archivo C++
// ==========================================================
#include "config.h"
#include <ArduinoJson.h>

int packetCounter = 0;
unsigned long lastTelemetryTime = 0;

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(LED_PIN, OUTPUT);

  Serial.println("==================================================");
  Serial.println("  VoltIDE Studio Firmware Inicializado!           ");
  Serial.println("  Dispositivo: ESP32 DevKit V1 (Dual-Core 240MHz) ");
  Serial.println("  config.h y C++ vinculados correctamente.       ");
  Serial.println("==================================================");
  Serial.println("Escribe 'HELP' o 'LED_ON' en el Monitor Serie.");
}

void loop() {
  // Comprobación de comandos recibidos por el puerto COM (Real o Virtual)
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    processSerialCommand(cmd);
  }

  // Enviar telemetría periódica
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    packetCounter++;

    // Parpadeo del LED onboard (GPIO 2 en ESP32 DevKit)
    digitalWrite(LED_PIN, HIGH);
    delay(40);
    digitalWrite(LED_PIN, LOW);

    int rawSensor = analogRead(SENSOR_PIN);
    sendTelemetryPacket(packetCounter, rawSensor);
  }
}

void processSerialCommand(String cmd) {
  cmd.toUpperCase();
  if (cmd == "LED_ON") {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("OK: LED Encendido");
  } else if (cmd == "LED_OFF") {
    digitalWrite(LED_PIN, LOW);
    Serial.println("OK: LED Apagado");
  } else if (cmd == "STATUS" || cmd == "PING") {
    Serial.print("PONG: ");
    Serial.print(DEVICE_NAME);
    Serial.print(" | Uptime: ");
    Serial.print(millis() / 1000);
    Serial.println("s");
  } else if (cmd == "HELP") {
    Serial.println("Comandos disponibles: LED_ON, LED_OFF, STATUS, PING");
  } else if (cmd.length() > 0) {
    Serial.print("Comando desconocido: ");
    Serial.println(cmd);
  }
}

void sendTelemetryPacket(int seq, int sensorVal) {
  // Formato para el Serial Plotter en tiempo real:
  // VoltIDE graficará automáticamente 'Sensor' y 'Seq'
  Serial.print("Sensor:");
  Serial.print(sensorVal);
  Serial.print(",Seq:");
  Serial.println(seq * 5);
}`
  },
  {
    name: 'config.h',
    content: `// ==========================================================
// config.h - Definiciones de Pines y Parámetros del Sistema
// Se combina automáticamente con el código C++ (.ino / .cpp)
// ==========================================================
#ifndef CONFIG_H
#define CONFIG_H

// Pines de Hardware para ESP32 DevKit & compatibilidad
#if defined(ESP32) || defined(ARDUINO_ARCH_ESP32)
  #define LED_PIN          2       // LED azul integrado en ESP32 DevKit (GPIO2)
  #define SENSOR_PIN       34      // ADC1 GPIO34 (Lectura analógica segura con WiFi)
  #define I2C_SDA_PIN      21      // Bus I2C SDA
  #define I2C_SCL_PIN      22      // Bus I2C SCL
#else
  #define LED_PIN          13      // LED integrado en Arduino Uno/Nano
  #define SENSOR_PIN       A0      // Pin analógico A0
  #define I2C_SDA_PIN      A4
  #define I2C_SCL_PIN      A5
#endif

// Parámetros de Comunicación Serie y Telemetría
#define BAUD_RATE              115200
#define TELEMETRY_INTERVAL_MS  400
#define DEVICE_NAME            "ESP32-DevKit-VoltIDE"

// Prototipos de funciones compartidas entre archivos C++
void processSerialCommand(String cmd);
void sendTelemetryPacket(int seq, int sensorVal);

#endif // CONFIG_H`
  }
];

export default function App() {
  // Board & Libraries State - Default to ESP32 DevKit V1
  const [boards] = useState<MicroBoard[]>(SUPPORTED_BOARDS);
  const [selectedBoard, setSelectedBoard] = useState<MicroBoard>(SUPPORTED_BOARDS[0]); // ESP32 DevKit V1

  const [libraries, setLibraries] = useState<ArduinoLibrary[]>(() => {
    const saved = localStorage.getItem('voltide_libraries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_LIBRARIES;
  });

  // Community Sketches State
  const [communitySketches, setCommunitySketches] = useState<CommunitySketch[]>(() => {
    const saved = localStorage.getItem('voltide_community_sketches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_COMMUNITY_SKETCHES;
  });

  const [likedSketchIds, setLikedSketchIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('voltide_liked_sketches');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {}
    }
    return new Set();
  });

  // Editor Files State
  const [files, setFiles] = useState<SketchFile[]>(() => {
    const saved = localStorage.getItem('voltide_current_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SKETCH;
  });
  const [activeFileName, setActiveFileName] = useState<string>('main.ino');

  // Compilation & Build State
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Active Bottom Panel: 'console' | 'monitor' | 'plotter' | 'none'
  const [activeBottomPanel, setActiveBottomPanel] = useState<'console' | 'monitor' | 'plotter' | 'none'>('console');
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);

  // Modals & Drawers
  const [isLibraryManagerOpen, setIsLibraryManagerOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPinoutModalOpen, setIsPinoutModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState(false);
  const [isComModalOpen, setIsComModalOpen] = useState(false);

  // Tornasol Theme Mode ('obsidian' dark or 'opal' pearlescent light)
  const [themeMode, setThemeMode] = useState<'obsidian' | 'opal'>(() => {
    return (localStorage.getItem('voltide_theme_mode') as 'obsidian' | 'opal') || 'obsidian';
  });

  const handleToggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'obsidian' ? 'opal' : 'obsidian';
      localStorage.setItem('voltide_theme_mode', next);
      return next;
    });
  };

  // Serial & COM Port State
  const [serialLogs, setSerialLogs] = useState<SerialLogEntry[]>([]);
  const [isComConnected, setIsComConnected] = useState(false);
  const [comPortName, setComPortName] = useState('');
  const [isVirtualCom, setIsVirtualCom] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [virtualLedPinState, setVirtualLedPinState] = useState(false);

  // Persist files, libraries, sketches
  useEffect(() => {
    localStorage.setItem('voltide_current_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('voltide_libraries', JSON.stringify(libraries));
  }, [libraries]);

  useEffect(() => {
    localStorage.setItem('voltide_community_sketches', JSON.stringify(communitySketches));
  }, [communitySketches]);

  // Subscribe to Serial Manager logs
  useEffect(() => {
    const unsubscribe = serialManager.subscribe((data: string) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100)).padStart(1, '0')}`;
      
      const isSys = data.startsWith('[VoltIDE');
      setSerialLogs(prev => [
        ...prev.slice(-300),
        {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: timeStr,
          direction: isSys ? 'system' : 'in',
          text: data
        }
      ]);

      setVirtualLedPinState(serialManager.virtualPin13);
    });

    return () => unsubscribe();
  }, []);

  // Update virtual LED in UI loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (serialManager.isVirtualActive) {
        setVirtualLedPinState(serialManager.virtualPin13);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // File Operations
  const handleSelectFile = (name: string) => {
    setActiveFileName(name);
  };

  const handleAddFile = (name: string) => {
    const isHeader = name.endsWith('.h');
    const template = isHeader
      ? `// ${name}\n#ifndef ${name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}\n#define ${name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}\n\n// Declaraciones de funciones y macros\n\n#endif\n`
      : `// ${name}\n#include <Arduino.h>\n#include "config.h"\n\n// Implementaciones C++\n`;

    const newFiles = [...files, { name, content: template }];
    setFiles(newFiles);
    setActiveFileName(name);
  };

  const handleDeleteFile = (name: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter(f => f.name !== name);
    setFiles(remaining);
    if (activeFileName === name) {
      setActiveFileName(remaining[0].name);
    }
  };

  const handleUpdateContent = (fileName: string, content: string) => {
    setFiles(prev => prev.map(f => (f.name === fileName ? { ...f, content } : f)));
  };

  // Direct Paste Code Handling
  const handleApplyPastedCode = (code: string, fileName?: string, isNewTab?: boolean) => {
    if (isNewTab && fileName) {
      const newFiles = [...files, { name: fileName, content: code }];
      setFiles(newFiles);
      setActiveFileName(fileName);
    } else {
      const targetName = fileName || activeFileName;
      handleUpdateContent(targetName, code);
    }
  };

  // Compile & Verify
  const handleVerify = useCallback(() => {
    setIsCompiling(true);
    setActiveBottomPanel('console');

    setTimeout(() => {
      const res = compileSketch(files, selectedBoard, libraries);
      setCompilationResult(res);
      setIsCompiling(false);
    }, 350);
  }, [files, selectedBoard, libraries]);

  // Upload & Flash
  const handleUpload = () => {
    setIsCompiling(true);
    setActiveBottomPanel('console');

    setTimeout(() => {
      const res = compileSketch(files, selectedBoard, libraries);
      setCompilationResult(res);
      setIsCompiling(false);

      if (res.success) {
        setIsUploading(true);
        setUploadProgress(0);

        let prog = 0;
        const uploadTimer = setInterval(() => {
          prog += 20;
          setUploadProgress(Math.min(100, prog));

          if (prog >= 100) {
            clearInterval(uploadTimer);
            setIsUploading(false);

            setCompilationResult(prev => {
              if (!prev) return null;
              return {
                ...prev,
                logs: [
                  ...prev.logs,
                  `\n[Upload] Conectando con programador en ${isComConnected ? comPortName || 'COM3' : 'Virtual COM'}...`,
                  `[Upload] Escribiendo binario en flash 0x00010000... (100%)`,
                  `[Upload] Verificados ${prev.flashUsed} bytes en 0.78 segundos (348.2 kbit/s)...`,
                  `[Upload] Reiniciando placa vía pin RTS (ESP32 EN)...`,
                  `✓ ¡Firmware flasheado con éxito en ${selectedBoard.name}!`
                ]
              };
            });

            if (!isComConnected) {
              handleToggleVirtualCom();
            }
          }
        }, 150);
      }
    }, 300);
  };

  // COM Port Connection Handlers
  const handleConnectPhysicalCom = async () => {
    if (isComConnected) {
      await serialManager.disconnectPhysical();
      serialManager.stopVirtual();
      setIsComConnected(false);
      setComPortName('');
      setIsVirtualCom(false);
      return;
    }

    if (serialManager.isWebSerialSupported()) {
      const res = await serialManager.connectPhysical(baudRate);
      if (res.success) {
        setIsComConnected(true);
        setComPortName(res.portName);
        setIsVirtualCom(false);
        setActiveBottomPanel('monitor');
      } else {
        handleToggleVirtualCom();
      }
    } else {
      handleToggleVirtualCom();
    }
  };

  const handleToggleVirtualCom = () => {
    if (isComConnected && isVirtualCom) {
      serialManager.stopVirtual();
      setIsComConnected(false);
      setIsVirtualCom(false);
      setComPortName('');
    } else {
      serialManager.startVirtual(baudRate);
      setIsComConnected(true);
      setIsVirtualCom(true);
      setComPortName('Virtual COM3 (Simulador)');
      setActiveBottomPanel('monitor');
    }
  };

  const handleSendMessage = (msg: string, lineEnding: 'none' | 'nl' | 'cr' | 'nl_cr' = 'nl') => {
    let payload = msg;
    if (lineEnding === 'nl') payload += '\n';
    if (lineEnding === 'cr') payload += '\r';
    if (lineEnding === 'nl_cr') payload += '\r\n';

    serialManager.write(payload);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setSerialLogs(prev => [
      ...prev,
      {
        id: `log_${Date.now()}`,
        timestamp: timeStr,
        direction: 'out',
        text: msg
      }
    ]);
  };

  // Library Handlers
  const handleToggleInstallLibrary = (id: string) => {
    setLibraries(prev =>
      prev.map(lib => (lib.id === id ? { ...lib, installed: !lib.installed } : lib))
    );
  };

  const handleIncludeInSketch = (header: string) => {
    const entryFile = files.find(f => f.isEntry) || files[0];
    if (!entryFile) return;

    if (entryFile.content.includes(`#include <${header}>`) || entryFile.content.includes(`#include "${header}"`)) {
      return;
    }

    const newContent = `#include <${header}>\n` + entryFile.content;
    handleUpdateContent(entryFile.name, newContent);
  };

  const handleLoadLibraryExample = (lib: ArduinoLibrary) => {
    const code = lib.sampleCode || `// Example for ${lib.name}\n#include <${lib.headers[0]}>\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  delay(1000);\n}`;
    const exampleName = lib.name;
    const newFileName = `${exampleName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_example.ino`;
    const newFiles = [...files, { name: newFileName, content: code }];
    setFiles(newFiles);
    setActiveFileName(newFileName);
    setIsLibraryManagerOpen(false);
  };

  const handleAddCustomLibrary = (newLib: ArduinoLibrary) => {
    setLibraries(prev => [newLib, ...prev]);
  };

  // Community Sketches Handlers
  const handleLoadCommunitySketch = (sketch: CommunitySketch) => {
    setFiles(sketch.files);
    setActiveFileName(sketch.files[0]?.name || 'main.ino');

    const matchedBoard = boards.find(
      b => b.id === sketch.boardId || b.name.toLowerCase().includes(sketch.boardId.toLowerCase())
    );
    if (matchedBoard) {
      setSelectedBoard(matchedBoard);
    }

    setLibraries(prev =>
      prev.map(lib => {
        const isRequired = sketch.requiredLibraries?.some(req =>
          lib.name.toLowerCase().includes(req.toLowerCase()) || lib.id === req
        );
        return isRequired ? { ...lib, installed: true } : lib;
      })
    );

    setCommunitySketches(prev =>
      prev.map(s => (s.id === sketch.id ? { ...s, views: s.views + 1 } : s))
    );

    setIsGalleryOpen(false);
  };

  const handleToggleLike = (sketchId: string) => {
    setLikedSketchIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(sketchId);

      if (isLiked) {
        next.delete(sketchId);
      } else {
        next.add(sketchId);
      }

      setCommunitySketches(sketches =>
        sketches.map(s => {
          if (s.id === sketchId) {
            return { ...s, likes: isLiked ? Math.max(0, s.likes - 1) : s.likes + 1 };
          }
          return s;
        })
      );

      localStorage.setItem('voltide_liked_sketches', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handlePublishSuccess = (newSketch: CommunitySketch) => {
    setCommunitySketches(prev => [newSketch, ...prev]);
    setIsPublishModalOpen(false);
    setIsGalleryOpen(true);
  };

  // Flatten / Combine All Tabs into one
  const handleFlattenFiles = () => {
    const combined = generateCombinedCode(files);
    const newFiles: SketchFile[] = [
      {
        name: 'unified_sketch.ino',
        isEntry: true,
        content: combined
      }
    ];
    setFiles(newFiles);
    setActiveFileName('unified_sketch.ino');
  };

  const handleExportIno = () => {
    const entryFile = files.find(f => f.isEntry) || files[0];
    const blob = new Blob([entryFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entryFile.name.endsWith('.ino') ? entryFile.name : `${entryFile.name}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewSketch = () => {
    setFiles(DEFAULT_SKETCH);
    setActiveFileName('main.ino');
    setCompilationResult(null);
  };

  const activeFile = files.find(f => f.name === activeFileName) || files[0];
  const isOpal = themeMode === 'opal';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
      isOpal ? 'tornasol-ambient-opal text-slate-800' : 'tornasol-ambient-dark text-slate-100'
    }`}>
      {/* Top Application Header */}
      <Header
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        comPortName={comPortName}
        isComConnected={isComConnected}
        isVirtualCom={isVirtualCom}
        onConnectCom={handleConnectPhysicalCom}
        onToggleVirtualCom={handleToggleVirtualCom}
        onOpenComModal={() => setIsComModalOpen(true)}
        onOpenCombinedCode={() => setIsCombinedModalOpen(true)}
        onVerify={handleVerify}
        onUpload={handleUpload}
        isCompiling={isCompiling}
        isUploading={isUploading}
        activeBottomPanel={activeBottomPanel}
        onToggleBottomPanel={panel =>
          setActiveBottomPanel(prev => (prev === panel ? 'none' : panel))
        }
        onOpenLibraries={() => setIsLibraryManagerOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenPinout={() => setIsPinoutModalOpen(true)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onExportIno={handleExportIno}
        onNewSketch={handleNewSketch}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Hardware MCU Status Strip */}
      <HardwareSimulator
        board={selectedBoard}
        ledPinState={virtualLedPinState}
        isConnected={isComConnected}
        isVirtual={isVirtualCom}
        onReset={() => {
          if (isVirtualCom) serialManager.startVirtual(baudRate);
        }}
        isOpal={isOpal}
      />

      {/* Main Center Area: Code Editor */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <CodeEditor
          files={files}
          activeFileName={activeFileName}
          onSelectFile={handleSelectFile}
          onAddFile={handleAddFile}
          onDeleteFile={handleDeleteFile}
          onUpdateContent={handleUpdateContent}
          onFlattenFiles={handleFlattenFiles}
          errorLine={compilationResult?.error?.line}
          errorFile={compilationResult?.error?.file}
          onQuickVerify={handleVerify}
          isOpal={isOpal}
        />
      </div>

      {/* Bottom Collapsible Panels: Console, Serial Monitor, Serial Plotter */}
      {activeBottomPanel !== 'none' && (
        <div
          className="border-t border-[#232e42] flex flex-col shrink-0 transition-all duration-150"
          style={{ height: `${bottomPanelHeight}px` }}
        >
          {activeBottomPanel === 'console' && (
            <OutputConsole
              compilationResult={compilationResult}
              isCompiling={isCompiling}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onClear={() => setCompilationResult(null)}
              onJumpToError={(line, file) => {
                const target = files.find(f => f.name === file);
                if (target) setActiveFileName(target.name);
              }}
            />
          )}

          {activeBottomPanel === 'monitor' && (
            <SerialMonitor
              logs={serialLogs}
              isConnected={isComConnected}
              portName={comPortName}
              baudRate={baudRate}
              onBaudRateChange={setBaudRate}
              onSendMessage={handleSendMessage}
              onClearLogs={() => setSerialLogs([])}
              onToggleConnect={() => setIsComModalOpen(true)}
              isVirtual={isVirtualCom}
            />
          )}

          {activeBottomPanel === 'plotter' && (
            <SerialPlotter
              logs={serialLogs}
              isConnected={isComConnected}
              onClearLogs={() => setSerialLogs([])}
            />
          )}
        </div>
      )}

      {/* Combined Code (config.h + C++) Inspector Modal */}
      <CombinedCodeModal
        files={files}
        board={selectedBoard}
        isOpen={isCombinedModalOpen}
        onClose={() => setIsCombinedModalOpen(false)}
        onVerify={handleVerify}
        isOpal={isOpal}
      />

      {/* COM Port Selector & Diagnostics Modal (Reales y Virtuales) */}
      <ComPortModal
        isOpen={isComModalOpen}
        onClose={() => setIsComModalOpen(false)}
        isComConnected={isComConnected}
        isVirtualCom={isVirtualCom}
        comPortName={comPortName}
        baudRate={baudRate}
        onBaudRateChange={setBaudRate}
        onConnectPhysical={handleConnectPhysicalCom}
        onToggleVirtual={handleToggleVirtualCom}
        onSendMessage={handleSendMessage}
        isOpal={isOpal}
      />

      {/* Integrated VoltAI Copilot Drawer */}
      <VoltAICopilot
        currentCode={activeFile?.content || ''}
        boardName={selectedBoard.name}
        activeFileName={activeFileName}
        installedLibraries={libraries.filter(l => l.installed).map(l => l.name)}
        compilerError={compilationResult?.error || null}
        onApplyCode={code => handleUpdateContent(activeFileName, code)}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Direct Paste Code Modal */}
      <PasteCodeModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApplyPastedCode={handleApplyPastedCode}
        activeFileName={activeFileName}
      />

      {/* Library Manager Drawer (with Community Hub & Publishing) */}
      <LibraryManager
        libraries={libraries}
        onToggleInstall={handleToggleInstallLibrary}
        onIncludeInSketch={handleIncludeInSketch}
        onLoadExample={handleLoadLibraryExample}
        onAddCustomLibrary={handleAddCustomLibrary}
        isOpen={isLibraryManagerOpen}
        onClose={() => setIsLibraryManagerOpen(false)}
      />

      {/* Community Gallery Full Screen Modal */}
      <CommunityGallery
        sketches={communitySketches}
        boards={boards}
        onLoadSketch={handleLoadCommunitySketch}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onToggleLike={handleToggleLike}
        likedSketchIds={likedSketchIds}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Publish Current Sketch / Paste Code to Community Modal */}
      <PublishModal
        files={files}
        board={selectedBoard}
        availableBoards={boards}
        installedLibraries={libraries.filter(l => l.installed)}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublishSuccess={handlePublishSuccess}
      />

      {/* Hardware Pinout Reference Modal */}
      <BoardPinoutModal
        board={selectedBoard}
        isOpen={isPinoutModalOpen}
        onClose={() => setIsPinoutModalOpen(false)}
        isOpal={isOpal}
      />
    </div>
  );
}
