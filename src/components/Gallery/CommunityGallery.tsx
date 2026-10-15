import React, { useState } from 'react';
import { CommunitySketch, MicroBoard, ArduinoLibrary } from '../../types/ide';
import { CodePreviewModal } from './CodePreviewModal';
import {
  Search,
  UploadCloud,
  Heart,
  Eye,
  ArrowRight,
  Code2,
  Download,
  X,
  Filter,
  Check,
  Cpu,
  Layers
} from 'lucide-react';

interface CommunityGalleryProps {
  sketches: CommunitySketch[];
  boards: MicroBoard[];
  onLoadSketch: (sketch: CommunitySketch) => void;
  onOpenPublishModal: () => void;
  onToggleLike: (sketchId: string) => void;
  likedSketchIds: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityGallery: React.FC<CommunityGalleryProps> = ({
  sketches,
  boards,
  onLoadSketch,
  onOpenPublishModal,
  onToggleLike,
  likedSketchIds,
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewSketch, setPreviewSketch] = useState<CommunitySketch | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'IoT/Networking', 'LED/Lighting', 'Sensors', 'Motors', 'Displays'];

  const filtered = sketches.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesBoard = selectedBoard === 'All' || item.boardId === selectedBoard;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesBoard && matchesCategory;
  });

  const getBoardName = (boardId: string) => {
    const b = boards.find(b => b.id === boardId);
    return b ? b.name : boardId;
  };

  const handleDownloadIno = (sketch: CommunitySketch) => {
    const entry = sketch.files.find(f => f.isEntry) || sketch.files[0];
    if (!entry) return;
    const blob = new Blob([entry.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-[#07090e] tornasol-ambient-dark z-40 flex flex-col text-slate-100 overflow-hidden">
      {/* Tornasol Specular Light Band */}
      <div className="h-[3px] bg-tornasol-fluid w-full shadow-[0_0_12px_rgba(179,136,255,0.6)]" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d121c]/80 border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-tornasol-fluid p-[1px] shadow-sm">
            <div className="w-full h-full bg-[#0d121c] rounded-[11px] flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-white">Community Code Gallery</h1>
            <p className="text-xs text-slate-400">
              Discover, test, and publish open-source microcontroller firmware and library routines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="btn-tornasol flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish Your Code</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Return to IDE Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-[#12161f] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, tag, library, author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-teal-500 rounded-lg text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Board Filter */}
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Board:</span>
            <select
              value={selectedBoard}
              onChange={e => setSelectedBoard(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#161b22]">All Hardware Boards</option>
              {boards.map(b => (
                <option key={b.id} value={b.id} className="bg-[#161b22]">{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#090d13]">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-500 space-y-3">
              <Layers className="w-10 h-10 mx-auto opacity-30 text-teal-400" />
              <p className="text-sm">No community sketches found matching your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedBoard('All');
                  setSelectedCategory('All');
                }}
                className="text-xs text-teal-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(item => {
                const isLiked = likedSketchIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-[#161b22] border border-[#30363d] hover:border-teal-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-900/60 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                            {item.authorAvatar || item.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{item.author}</div>
                            <div className="text-[11px] text-slate-500">{item.date}</div>
                          </div>
                        </div>

                        {item.isUserCreated && (
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-medium border border-teal-500/40">
                            Your Publication
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Board & Libraries Info */}
                      <div className="mt-3.5 pt-3 border-t border-[#21262d] text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="truncate">{getBoardName(item.boardId)}</span>
                        </div>

                        {item.requiredLibraries.length > 0 && (
                          <div className="text-[11px] text-slate-400 truncate font-mono">
                            Libs: <span className="text-teal-300">{item.requiredLibraries.join(', ')}</span>
                          </div>
                        )}

                        {/* Clean unboxed tags with typographic separator */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 flex-wrap">
                          {item.tags.map((tag, tIdx) => (
                            <React.Fragment key={tag}>
                              <span className="text-slate-400">#{tag}</span>
                              {tIdx < item.tags.length - 1 && <span aria-hidden="true" className="text-slate-600">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-[#21262d] flex items-center justify-between text-xs">
                      {/* Social Metrics */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleLike(item.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            isLiked ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-rose-400'
                          }`}
                          title={isLiked ? 'Liked' : 'Like sketch'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                          <span className="tabular-nums">{item.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        <span className="flex items-center gap-1 text-slate-500 tabular-nums">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{item.views}</span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewSketch(item)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#21262d] transition-colors"
                          title="Preview Code Files"
                        >
                          <Code2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadIno(item)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#21262d] transition-colors"
                          title="Download .ino file"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onLoadSketch(item);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-semibold text-xs transition-colors"
                        >
                          <span>Open in IDE</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Code Preview Modal */}
      <CodePreviewModal
        sketch={previewSketch}
        isOpen={Boolean(previewSketch)}
        onClose={() => setPreviewSketch(null)}
        onLoadIntoEditor={sketch => {
          onLoadSketch(sketch);
          onClose();
        }}
      />
    </div>
  );
};
