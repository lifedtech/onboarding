import { useState, useEffect } from 'react';
import { Shield, Zap, Gamepad2, X } from 'lucide-react';
import TicketDeflector from './TicketDeflector';
import ServerTugOfWar from './ServerTugOfWar';

export default function StressBuster({ onClose, gameSession, setGameSession }) {
  const [activeTab, setActiveTab] = useState(() => {
    const tab = window.__initialStressBusterTab || 'deflector';
    delete window.__initialStressBusterTab; // Clean up
    return tab;
  });

  // If a multiplayer game starts, set active tab based on gameType
  useEffect(() => {
    if (gameSession) {
      if (gameSession.gameType === 'tug_of_war') {
        setActiveTab('tug_of_war');
      } else {
        setActiveTab('deflector');
      }
    }
  }, [gameSession]);

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-8 bg-[#0b1413] text-[#e2e8f0] h-full overflow-y-auto">
      {/* Page Header Title Card */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-inner">
            <Gamepad2 className="w-5 h-5 animate-pulse text-brand-teal" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight leading-none">Stress-Buster Lounge</h1>
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider mt-1">Take a break and clear your head with mini-games</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-[#64748b] hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all"
          title="Back to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full max-w-2xl flex border-b border-white/10 mb-6 shrink-0">
        <button
          onClick={() => !gameSession && setActiveTab('deflector')}
          disabled={gameSession}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'deflector'
              ? 'border-brand-teal text-brand-teal bg-white/5'
              : 'border-transparent text-slate-400 hover:text-white'
          } ${gameSession ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Shield className="w-4 h-4" />
          Ticket Deflector
        </button>
        <button
          onClick={() => !gameSession && setActiveTab('tug_of_war')}
          disabled={gameSession}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tug_of_war'
              ? 'border-brand-teal text-brand-teal bg-white/5'
              : 'border-transparent text-slate-400 hover:text-white'
          } ${gameSession ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Zap className="w-4 h-4" />
          Server Tug of War
        </button>
      </div>

      {/* Game Content */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-start">
        {activeTab === 'deflector' ? (
          <TicketDeflector 
            standalone={false} 
            gameSession={gameSession} 
            setGameSession={setGameSession} 
            onClose={onClose}
          />
        ) : (
          <ServerTugOfWar 
            standalone={false} 
            gameSession={gameSession}
            setGameSession={setGameSession}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
