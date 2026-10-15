import React, { useState } from 'react';
import { ArduinoLibrary } from '../../types/ide';
import {
  Search,
  Plus,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Code2,
  BookOpen,
  X,
  Heart,
  UploadCloud,
  FileCode,
  Users,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LibraryManagerProps {
  libraries: ArduinoLibrary[];
  onToggleInstall: (libId: string) => void;
  onIncludeInSketch: (header: string) => void;
  onLoadExample: (lib: ArduinoLibrary) => void;
  onAddCustomLibrary: (lib: ArduinoLibrary) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  libraries,
  onToggleInstall,
  onIncludeInSketch,
  onLoadExample,
  onAddCustomLibrary,
  isOpen,
  onClose
}) => {
  const [tab, setTab] = useState<'all' | 'community'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyInstalled, setOnlyInstalled] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [inspectLib, setInspectLib] = useState<ArduinoLibrary | null>(null);

  // Community Library Form State
  const [libName, setLibName] = useState('');
  const [libVersion, setLibVersion] = useState('1.0.0');
  const [libAuthor, setLibAuthor] = useState(() => localStorage.getItem('voltide_author_name') || '');
  const [libCategory, setLibCategory] = useState<ArduinoLibrary['category']>('Utilities');
  const [libHeaderName, setLibHeaderName] = useState('');
  const [libHeaderCode, setLibHeaderCode] = useState('');
  const [libCppCode, setLibCppCode] = useState('');
  const [libSampleCode, setLibSampleCode] = useState('');
  const [libDesc, setLibDesc] = useState('');
  const [libRepo, setLibRepo] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Sensors', 'Displays', 'IoT/Networking', 'LED/Lighting', 'Motors', 'Utilities'];

  const filtered = libraries.filter(lib => {
    const matchesTab = tab === 'all' || (tab === 'community' && lib.isCommunity);
    const matchesSearch =
      lib.name.toLowerCase().includes(search.toLowerCase()) ||
      lib.author.toLowerCase().includes(search.toLowerCase()) ||
      lib.description.toLowerCase().includes(search.toLowerCase()) ||
      lib.headers.some(h => h.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || lib.category === selectedCategory;
    const matchesInstalled = !onlyInstalled || lib.installed;

    return matchesTab && matchesSearch && matchesCategory && matchesInstalled;
  });

  const handlePublishCommunityLib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libName.trim() || !libHeaderName.trim()) return;

    let cleanHeader = libHeaderName.trim();
    if (!cleanHeader.endsWith('.h')) cleanHeader += '.h';

    const defaultSample = libSampleCode.trim() || `#include <${cleanHeader}>\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  delay(1000);\n}`;

    const newLib: ArduinoLibrary = {
      id: `comm_lib_${Date.now()}`,
      name: libName.trim(),
      version: libVersion.trim() || '1.0.0',
      author: libAuthor.trim() || 'Community Maker',
      authorAvatar: (libAuthor.trim() || 'CM').slice(0, 2).toUpperCase(),
      category: libCategory,
      description: libDesc.trim() || 'Community external library for microcontrollers.',
      repositoryUrl: libRepo.trim() || 'https://github.com',
      headers: [cleanHeader],
      headerCode: libHeaderCode.trim(),
      cppCode: libCppCode.trim(),
      sampleCode: defaultSample,
      installed: true,
      isCommunity: true,
      likes: 1,
      downloads: 1
    };

    onAddCustomLibrary(newLib);
    setShowPublishModal(false);

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}

    // Reset form
    setLibName('');
    setLibHeaderName('');
    setLibHeaderCode('');
    setLibCppCode('');
    setLibSampleCode('');
    setLibDesc('');
    setLibRepo('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] lg:w-[600px] bg-[#0b0f19]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-40 flex flex-col text-slate-200">
      {/* Tornasol Specular Light Band */}
      <div className="h-[3px] bg-tornasol-fluid w-full shadow-[0_0_12px_rgba(179,136,255,0.6)]" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/30 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-tornasol-fluid p-[1px] shadow-sm">
            <div className="w-full h-full rounded-[7px] bg-[#0b0f19] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-tornasol">Gestor de Librerías</h2>
            <span className="text-[11px] text-slate-400">
              ({libraries.filter(l => l.installed).length} instaladas) · Comunidad & Oficiales
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="btn-tornasol flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold shadow-sm transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Subir Librería</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Segmented Tab: All vs Community Libraries */}
      <div className="px-4 pt-3 pb-2 bg-black/20 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              tab === 'all'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({libraries.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('community')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              tab === 'community'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3 text-cyan-300" />
            <span>Comunidad ({libraries.filter(l => l.isCommunity).length})</span>
          </button>
        </div>

        {/* Installed Only Checkbox */}
        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyInstalled}
            onChange={e => setOnlyInstalled(e.target.checked)}
            className="rounded bg-[#0d1117] border-[#30363d] text-teal-500 focus:ring-0"
          />
          <span>Installed Only</span>
        </label>
      </div>

      {/* Search & Categories Bar */}
      <div className="p-3 bg-[#101520]/60 border-b border-[#253042] space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search libraries (e.g. NeoPixel, JSON, MQTT, BLE, OLED)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#090d14] border border-[#253042] focus:border-teal-500 rounded-lg text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-500/20 text-teal-300 font-medium border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#18212e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Library Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#090d14]">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs space-y-2">
            <BookOpen className="w-8 h-8 mx-auto opacity-30 text-teal-400" />
            <p>No libraries found matching your criteria.</p>
          </div>
        ) : (
          filtered.map(lib => (
            <div
              key={lib.id}
              className={`p-3.5 rounded-xl border transition-all ${
                lib.installed
                  ? 'bg-[#121824] border-teal-500/40 shadow-sm'
                  : 'bg-[#0f141f] border-[#202938] hover:border-[#313f54]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{lib.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">v{lib.version}</span>
                    {lib.isCommunity && (
                      <span className="text-[10px] bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-medium border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                        Community Made
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    By <span className="text-slate-300 font-medium">{lib.author}</span> · {lib.category}
                  </div>
                </div>

                {/* Install / Uninstall Button */}
                <button
                  type="button"
                  onClick={() => onToggleInstall(lib.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    lib.installed
                      ? 'bg-teal-950 text-teal-300 border border-teal-600/50 hover:bg-red-950/80 hover:text-red-300 hover:border-red-600/50'
                      : 'bg-[#1e2736] hover:bg-teal-600 hover:text-white text-slate-200'
                  }`}
                  title={lib.installed ? 'Click to uninstall' : 'Click to install into IDE'}
                >
                  {lib.installed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Installed</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lib.description}
              </p>

              {/* Headers list */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Headers:</span>
                {lib.headers.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onIncludeInSketch(h)}
                    className="font-mono text-[11px] bg-[#080c12] hover:bg-teal-900/40 text-teal-300 px-2 py-0.5 rounded border border-[#253042] hover:border-teal-500 transition-colors"
                    title={`Click to insert #include <${h}> at top of sketch`}
                  >
                    +{h}
                  </button>
                ))}
              </div>

              {/* Action Links & Metrics */}
              <div className="mt-3 pt-2.5 border-t border-[#1e2736] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {lib.sampleCode && (
                    <button
                      type="button"
                      onClick={() => onLoadExample(lib)}
                      className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Load Example</span>
                    </button>
                  )}
                  {lib.headerCode && (
                    <button
                      type="button"
                      onClick={() => setInspectLib(lib)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>View Header (.h)</span>
                    </button>
                  )}
                  {lib.repositoryUrl && (
                    <a
                      href={lib.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Repo</span>
                    </a>
                  )}
                </div>

                {lib.likes !== undefined && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>{lib.likes}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspect Header Code Modal */}
      {inspectLib && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-white/10 rounded-2xl max-w-2xl w-full p-5 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#253042]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Header Code: {inspectLib.headers[0]}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectLib(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="mt-4 p-3 bg-[#080c12] rounded-lg font-mono text-xs text-slate-200 max-h-80 overflow-auto leading-relaxed border border-[#202938]">
              {inspectLib.headerCode || '// No header code available'}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectLib(null)}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Community Library Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-white/10 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col text-slate-200 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 via-purple-400 via-pink-400 to-amber-300" />
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#161d2b] border-b border-[#253042]">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Publish Community Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishCommunityLib} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Library Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NeoPixelRainbowFX"
                  value={libName}
                  onChange={e => setLibName(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#253042] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Author Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FernandoDev"
                    value={libAuthor}
                    onChange={e => setLibAuthor(e.target.value)}
                    className="w-full bg-[#080c12] border border-[#253042] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Version</label>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={libVersion}
                    onChange={e => setLibVersion(e.target.value)}
                    className="w-full bg-[#080c12] border border-[#253042] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Primary Header (.h) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeoPixelRainbowFX.h"
                    value={libHeaderName}
                    onChange={e => setLibHeaderName(e.target.value)}
                    className="w-full bg-[#080c12] border border-[#253042] rounded-lg px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={libCategory}
                    onChange={e => setLibCategory(e.target.value as any)}
                    className="w-full bg-[#080c12] border border-[#253042] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Header Source Code (.h) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="// Paste class and header definitions here..."
                  value={libHeaderCode}
                  onChange={e => setLibHeaderCode(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#253042] rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Example Sketch Code (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="// Paste usage example for the library..."
                  value={libSampleCode}
                  onChange={e => setLibSampleCode(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#253042] rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain what the library does and its API methods..."
                  value={libDesc}
                  onChange={e => setLibDesc(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#253042] rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#253042]">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1a2332] hover:bg-[#253247] text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold transition-all shadow-sm"
                >
                  Publish & Install Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
