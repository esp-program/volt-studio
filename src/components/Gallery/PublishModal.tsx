import React, { useState, useEffect } from 'react';
import { SketchFile, MicroBoard, ArduinoLibrary, CommunitySketch } from '../../types/ide';
import { UploadCloud, X, Check, Tag, Cpu, FileCode, Clipboard, Plus, Trash2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublishModalProps {
  files: SketchFile[];
  board: MicroBoard;
  availableBoards: MicroBoard[];
  installedLibraries: ArduinoLibrary[];
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess: (newSketch: CommunitySketch) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  files,
  board,
  availableBoards,
  installedLibraries,
  isOpen,
  onClose,
  onPublishSuccess
}) => {
  const [sourceMode, setSourceMode] = useState<'current' | 'paste'>('current');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem('voltide_author_name') || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sensors');
  const [selectedBoardId, setSelectedBoardId] = useState(board.id);
  const [tagsInput, setTagsInput] = useState(`${board.name.split(' ')[0]}, Embedded`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Pasted Files State
  const [pastedFiles, setPastedFiles] = useState<SketchFile[]>([
    {
      name: 'main.ino',
      isEntry: true,
      content: `// Paste your Arduino / ESP32 code here\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  delay(1000);\n}`
    }
  ]);
  const [activePasteFileIdx, setActivePasteFileIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedBoardId(board.id);
      const entryFile = files.find(f => f.isEntry) || files[0];
      const baseName = entryFile?.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') || 'My Project';
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  }, [isOpen, files, board.id]);

  if (!isOpen) return null;

  const currentFilesToUse = sourceMode === 'current' ? files : pastedFiles;

  // Auto-detect required libraries from included headers
  const detectedLibs: string[] = [];
  const fullCode = currentFilesToUse.map(f => f.content).join('\n');
  installedLibraries.forEach(lib => {
    if (lib.headers.some(h => fullCode.includes(h))) {
      detectedLibs.push(lib.name);
    }
  });

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedFiles(prev =>
          prev.map((f, i) => (i === activePasteFileIdx ? { ...f, content: text } : f))
        );
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleAddPastedFile = () => {
    const ext = pastedFiles.length === 1 ? 'config.h' : `module_${pastedFiles.length}.cpp`;
    setPastedFiles(prev => [...prev, { name: ext, content: `// ${ext}\n` }]);
    setActivePasteFileIdx(pastedFiles.length);
  };

  const handleDeletePastedFile = (idx: number) => {
    if (pastedFiles.length <= 1) return;
    setPastedFiles(prev => prev.filter((_, i) => i !== idx));
    setActivePasteFileIdx(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !description.trim()) return;

    setIsSubmitting(true);
    localStorage.setItem('voltide_author_name', author.trim());

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newSketch: CommunitySketch = {
      id: `user_sketch_${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      authorAvatar: author.trim().slice(0, 2).toUpperCase(),
      description: description.trim(),
      boardId: selectedBoardId,
      category,
      tags: tags.length > 0 ? tags : [board.name, category],
      files: JSON.parse(JSON.stringify(currentFilesToUse)),
      requiredLibraries: detectedLibs,
      likes: 1,
      views: 1,
      date: 'Just now',
      isUserCreated: true
    };

    setTimeout(() => {
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setIsSubmitting(false);
      onPublishSuccess(newSketch);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0f19]/95 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col text-slate-200 shadow-2xl overflow-hidden relative">
        {/* Holographic light diffraction accent */}
        <div className="h-[3px] bg-tornasol-fluid w-full shadow-[0_0_12px_rgba(179,136,255,0.6)] shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tornasol-fluid p-[1px] shadow-sm">
              <div className="w-full h-full rounded-[7px] bg-[#0b0f19] flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-tornasol">Publicar Código en la Galería</h2>
              <p className="text-[11px] text-slate-400">Comparte tu sketch para ESP32 DevKit, Arduino o microcontroladores</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Source Mode: Current Project vs Direct Code Paste */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">Origen del Código:</label>
            <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setSourceMode('current')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  sourceMode === 'current'
                    ? 'btn-tornasol shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Proyecto Actual ({files.length} archivos)</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('paste')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  sourceMode === 'paste'
                    ? 'btn-tornasol shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Pegar Código Directamente</span>
              </button>
            </div>
          </div>

          {/* Direct Code Paste Interface */}
          {sourceMode === 'paste' && (
            <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {pastedFiles.map((pf, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePasteFileIdx(idx)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer text-[11px] font-mono border transition-all ${
                        activePasteFileIdx === idx
                          ? 'bg-purple-950/60 text-cyan-300 border-cyan-400/50 font-semibold shadow-[0_0_10px_rgba(112,214,255,0.2)]'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span>{pf.name}</span>
                      {pastedFiles.length > 1 && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeletePastedFile(idx);
                          }}
                          className="hover:text-red-400"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPastedFile}
                    className="p-1 text-slate-400 hover:text-teal-400 rounded bg-[#101622] border border-[#263145]"
                    title="Add another file (.h or .cpp)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1 bg-[#1a2333] hover:bg-[#253247] text-teal-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Paste from Clipboard</span>
                </button>
              </div>

              {/* Code Textarea for Active File */}
              <div>
                <textarea
                  rows={8}
                  value={pastedFiles[activePasteFileIdx]?.content || ''}
                  onChange={e => {
                    const newText = e.target.value;
                    setPastedFiles(prev =>
                      prev.map((f, i) => (i === activePasteFileIdx ? { ...f, content: newText } : f))
                    );
                  }}
                  placeholder="Paste your C++ / Arduino sketch code here..."
                  className="w-full bg-[#06090e] border border-[#202a3a] focus:border-teal-500 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                />
              </div>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. ESP32 Wi-Fi Environmental Node with WebSockets"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Author Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. MakerDev"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Target Board</label>
              <select
                value={selectedBoardId}
                onChange={e => setSelectedBoardId(e.target.value)}
                className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                {availableBoards.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#121721]">{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="IoT/Networking">IoT & Networking</option>
                <option value="LED/Lighting">LED & Lighting</option>
                <option value="Sensors">Sensors & Telemetry</option>
                <option value="Motors">Robotics & Motors</option>
                <option value="Displays">Displays & Screens</option>
                <option value="Utilities">Utilities & Math</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Description *</label>
            <textarea
              rows={2}
              required
              placeholder="Explain what the sketch does, wiring pinouts, and hardware requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="ESP32, WiFi, Sensor, NeoPixel"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-[#090d14] border border-[#263145] focus:border-teal-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Detected Libraries */}
          {detectedLibs.length > 0 && (
            <div className="p-2.5 bg-[#090d14] rounded-lg border border-[#263145] text-[11px] text-slate-400">
              Auto-detected Required Libraries: <span className="text-teal-300 font-mono">{detectedLibs.join(', ')}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#263145]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1a2332] hover:bg-[#253247] text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Gallery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
