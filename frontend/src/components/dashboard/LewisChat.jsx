import React, { useState } from 'react';
import {   Sparkles, X, Minimize2, Send, Bot   } from 'lucide-react';

export default function LewisChat({ isOpen, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-brand-teal hover:bg-brand-teal-hover text-white shadow-xl shadow-brand-teal/30 p-4 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-4 border-white"
          title="Open Lewis AI"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <>


      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-br from-brand-teal to-emerald-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center gap-2 leading-none">
                Lewis
                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest bg-white/20 font-bold border border-white/30">AI</span>
              </h2>
              <p className="text-white/80 text-[10px] font-semibold mt-1">Your Operations Copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {/* Welcome Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0 border border-brand-teal/20">
              <Bot className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="flex-1 max-w-[85%]">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm space-y-3">
                <p className="text-sm text-text-main font-semibold">
                  Hello! I am Lewis, your dedicated AI operations assistant.
                </p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 font-bold leading-relaxed">
                    My AI features are currently being connected. Soon, I'll be able to help you cross-verify client authenticity by searching the web for their centers, public reputation, and external presence!
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 ml-1 block">System Message</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AI will be available soon..."
              disabled
              className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-brand-teal/50 focus:ring-2 focus:ring-brand-teal/10 disabled:opacity-70 disabled:cursor-not-allowed text-slate-500"
            />
            <button
              disabled
              className="absolute right-2 p-2 bg-slate-200 text-slate-400 rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
