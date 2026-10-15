import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Copy, Check, ArrowRight, RefreshCw, AlertTriangle, Code2, Cpu, Wrench } from 'lucide-react';

interface VoltAICopilotProps {
  currentCode: string;
  boardName: string;
  activeFileName: string;
  installedLibraries: string[];
  compilerError?: { line: number; message: string; file: string } | null;
  onApplyCode: (code: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  codeSnippet?: string;
}

export const VoltAICopilot: React.FC<VoltAICopilotProps> = ({
  currentCode,
  boardName,
  activeFileName,
  installedLibraries,
  compilerError,
  onApplyCode,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am **VoltAI**, your integrated firmware engineer. I can write Arduino C++ code, debug compile errors, design state machines, and configure peripherals for **${boardName}**.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const extractCode = (text: string): string | undefined => {
    const match = text.match(/```(?:cpp|c\+\+|ino|c)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : undefined;
  };

  const handleSend = async (userPrompt?: string) => {
    const promptToSend = userPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: 'user', text: promptToSend }
    ];
    setMessages(newMessages);
    if (!userPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          currentCode,
          boardName,
          libraries: installedLibraries
        })
      });

      const data = await response.json();
      const replyText = data.reply || data.fallback || 'I could not generate a response. Please check your prompt.';
      const code = extractCode(replyText);

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: replyText,
          codeSnippet: code
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Network error: ${err.message}. Please verify the dev server.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixCompilerError = async () => {
    if (!compilerError) return;
    setIsLoading(true);

    const userMsgId = `user_${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: `Please fix compilation error in ${compilerError.file} at line ${compilerError.line}: "${compilerError.message}"`
      }
    ]);

    try {
      const response = await fetch('/api/ai/fix-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          errorMessage: `${compilerError.file}:${compilerError.line}: ${compilerError.message}`,
          boardName,
          file: activeFileName
        })
      });

      const data = await response.json();
      const reply = data.reply || `Fixed code for ${compilerError.file}.`;
      const fixedCode = data.fixedCode || extractCode(reply);

      setMessages(prev => [
        ...prev,
        {
          id: `ai_fix_${Date.now()}`,
          role: 'assistant',
          text: reply,
          codeSnippet: fixedCode
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          text: `Could not reach fix service: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Create an ESP32 Async Web Server with JSON API',
    'Add non-blocking millis() timer',
    'I2C Sensor Scanner with Serial logs',
    'Configure Deep Sleep with timer wakeup',
    'Optimize memory & reduce RAM usage'
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[550px] bg-[#0c1017]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 flex flex-col text-slate-200">
      {/* Holographic Top Banner Inspired by Rainbow Light Refraction */}
      <div className="h-1 bg-gradient-to-r from-teal-400 via-purple-400 via-pink-400 to-amber-300" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131922] border-b border-[#263140]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 p-[1px] shadow-sm">
            <div className="w-full h-full bg-[#0d121a] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">VoltAI Embedded Copilot</h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Targeting {boardName} · {activeFileName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-[#1f2836] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Compiler Error Quick Alert (if active error) */}
      {compilerError && (
        <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-red-300 truncate">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">Error on line {compilerError.line}: {compilerError.message}</span>
          </div>
          <button
            type="button"
            onClick={handleFixCompilerError}
            disabled={isLoading}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded text-xs font-semibold shrink-0 shadow-sm transition-colors flex items-center gap-1"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Fix with AI</span>
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-xl p-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-[#151c27] border border-[#273243] text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text.replace(/```(?:cpp|c\+\+|ino|c)?\n[\s\S]*?```/g, '')}</div>

              {/* Extracted Code Snippet with Apply Action */}
              {msg.codeSnippet && (
                <div className="mt-3 pt-2.5 border-t border-[#2d3a4d] bg-[#090d14] rounded-lg p-3 font-mono text-[11px] overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212b3a] text-slate-400">
                    <span className="text-teal-400 font-semibold flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Generated C++ Firmware</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                        className="hover:text-white flex items-center gap-1 text-[11px] text-slate-300"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyCode(msg.codeSnippet!)}
                        className="px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-sans font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Replace active editor file with this code"
                      >
                        <span>Apply to Editor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <pre className="max-h-60 overflow-y-auto overflow-x-auto text-slate-200 leading-5">
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
            <span>VoltAI is formulating microcontroller firmware...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-[#101620] border-t border-[#202937] overflow-x-auto flex items-center gap-1.5 text-[11px]">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-[#1a2330] hover:bg-teal-900/40 hover:text-teal-300 border border-[#2b3748] rounded-full whitespace-nowrap text-slate-300 transition-colors disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#131922] border-t border-[#263140] flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={`Ask VoltAI for ${boardName} code or pin wiring...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-[#090d14] border border-[#2d3a4d] focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold rounded-lg text-xs disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
