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
    <div className="flex-1 flex flex-col items-center p-6 md:p-8 bg-slate-50/50 text-text-main h-full overflow-y-auto font-sans">
      {/* Page Header Title Card */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 border-b border-border-leaf pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-sm">
            <Gamepad2 className="w-5 h-5 animate-pulse text-brand-teal" />
          </div>
          <div>
            <h1 className="text-text-main font-black text-2xl tracking-tight leading-none">Stress-Buster Lounge</h1>
            <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mt-1.5">Take a break and clear your head with mini-games</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-text-main hover:bg-slate-100 p-2 rounded-[12px] transition-all"
          title="Back to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full max-w-2xl flex border-b border-border-leaf mb-6 shrink-0 gap-2">
        <button
          onClick={() => !gameSession && setActiveTab('deflector')}
          disabled={gameSession}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 rounded-t-[12px] ${
            activeTab === 'deflector'
              ? 'border-brand-teal text-brand-teal bg-brand-teal/5'
              : 'border-transparent text-slate-500 hover:text-text-main hover:bg-slate-50'
          } ${gameSession ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Shield className="w-4 h-4" />
          Ticket Deflector
        </button>
        <button
          onClick={() => !gameSession && setActiveTab('tug_of_war')}
          disabled={gameSession}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 rounded-t-[12px] ${
            activeTab === 'tug_of_war'
              ? 'border-brand-teal text-brand-teal bg-brand-teal/5'
              : 'border-transparent text-slate-500 hover:text-text-main hover:bg-slate-50'
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
