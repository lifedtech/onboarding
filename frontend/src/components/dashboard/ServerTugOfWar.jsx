import { useState, useEffect } from 'react';
import { Shield, Zap, AlertTriangle, RotateCcw, X, Volume2, VolumeX, Trophy, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../../lib/axios';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function ServerTugOfWar({ onClose, gameSession, setGameSession, standalone = true }) {
  const [health, setHealth] = useState(50);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(''); // 'win' | 'lose' | 'timeout' | 'host_win' | 'guest_win' | 'draw'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clickEffect, setClickEffect] = useState(false);
  const [particles, setParticles] = useState([]);

  // Lobby lists and modes
  const [mode, setMode] = useState(() => {
    if (gameSession && gameSession.gameType === 'tug_of_war') {
      return 'multiplayer_active';
    }
    return 'lobby';
  });
  const [teammates, setTeammates] = useState([]);
  const [invitingPlayerId, setInvitingPlayerId] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(''); // 'waiting' | 'declined'

  const currentUser = useOpsStore((s) => s.user);
  const token = useOpsStore((s) => s.token);
  const isHost = gameSession ? gameSession.hostId === currentUser?.id : true;

  // Synthesizer Audio
  const playBeep = (freq, type = 'sine', duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked
    }
  };

  // Spark/Particle Emitter on click/mashing
  const createSparks = (e) => {
    const newParticles = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      newParticles.push({
        id: Math.random(),
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: Math.random() * 4 + 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Update particles positions
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - 0.08,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [particles]);

  // Handle mashing trigger (PULL / RESOLVE)
  const handleResolve = (e) => {
    if (!isPlaying || isGameOver) return;
    
    // Trigger visual click animations
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 80);
    createSparks(e);

    if (mode === 'multiplayer_active') {
      if (isHost) {
        // Host (P1) pulls: Increase health by 2%
        setHealth((prev) => {
          const next = Math.min(100, prev + 2);
          if (next >= 100) {
            endGame('host_win');
            return 100;
          }
          return next;
        });
        playBeep(400 + health * 4, 'sine', 0.08);
      } else {
        // Guest (P2) pulls: Send 'pull' request to Host
        api.post('/game/sync', {
          gameId: gameSession.id,
          type: 'pull'
        }).catch(() => {});
        playBeep(400 + (100 - health) * 4, 'sine', 0.08);
      }
    } else {
      // Single player
      setHealth((prev) => {
        const next = Math.min(100, prev + 2);
        if (next >= 100) {
          endGame('win');
          return 100;
        }
        return next;
      });
      playBeep(400 + health * 4, 'sine', 0.08);
    }
  };

  // Listen for Spacebar mashing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        handleResolve(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, health, mode, gameSession]);

  // Start / Reset Game
  const startGame = () => {
    setHealth(50);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    setGameResult('');
    setParticles([]);
    playBeep(523.25, 'sine', 0.15); // C5
    setTimeout(() => playBeep(659.25, 'sine', 0.15), 100); // E5
  };

  // End Game
  const endGame = (result) => {
    setIsPlaying(false);
    setIsGameOver(true);
    setGameResult(result);

    // If multiplayer Host, dispatch gameover sync
    if (mode === 'multiplayer_active' && isHost && gameSession) {
      api.post('/game/sync', {
        gameId: gameSession.id,
        type: 'gameover',
        health,
        gameResult: result
      }).catch(() => {});
    }

    const isWinner = result === 'win' || 
      (mode === 'multiplayer_active' && ((isHost && result === 'host_win') || (!isHost && result === 'guest_win')));
    const isLoser = result === 'lose' || 
      (mode === 'multiplayer_active' && ((isHost && result === 'guest_win') || (!isHost && result === 'host_win')));

    if (isWinner) {
      playBeep(523.25, 'triangle', 0.1);
      setTimeout(() => playBeep(659.25, 'triangle', 0.1), 100);
      setTimeout(() => playBeep(783.99, 'triangle', 0.15), 200);
      setTimeout(() => playBeep(1046.50, 'sine', 0.4), 300);
    } else if (isLoser) {
      playBeep(220, 'sawtooth', 0.25);
      setTimeout(() => playBeep(146.83, 'sawtooth', 0.5), 200);
    } else {
      playBeep(330, 'triangle', 0.3);
    }
  };

  // 30-Second Countdown timer
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    if (mode === 'multiplayer_active' && !isHost) return;

    if (timeLeft <= 0) {
      if (mode === 'multiplayer_active') {
        if (health > 50) {
          endGame('host_win');
        } else if (health < 50) {
          endGame('guest_win');
        } else {
          endGame('draw');
        }
      } else {
        endGame('timeout');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, timeLeft, mode, isHost, health]);

  // Relentless Server Traffic Drain (-1.5% every 100ms) - solo only
  useEffect(() => {
    if (!isPlaying || isGameOver || mode === 'multiplayer_active') return;

    const drain = setInterval(() => {
      setHealth((prev) => {
        const next = Math.max(0, prev - 1.5);
        if (next <= 0) {
          endGame('lose');
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(drain);
  }, [isPlaying, isGameOver, mode]);

  // Fetch team members when lobby loads
  useEffect(() => {
    if (mode === 'lobby') {
      api.get('/users').then(({ data }) => {
        setTeammates(data.filter((u) => u.id !== currentUser?.id));
      }).catch(() => {});
    }
  }, [mode, currentUser]);

  // Handle incoming Multiplayer Session triggers
  useEffect(() => {
    if (gameSession && gameSession.gameType === 'tug_of_war') {
      setMode('multiplayer_active');
      setIsPlaying(true);
      setIsGameOver(false);
      setHealth(50);
      setTimeLeft(30);
      setGameResult('');
      setParticles([]);
    }
  }, [gameSession]);

  // Online Multiplayer SSE Synchronizer
  useEffect(() => {
    if (!gameSession || gameSession.gameType !== 'tug_of_war' || !token) return;

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const es = new EventSource(url);

    es.addEventListener('game_sync', (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'state') {
        if (!isHost) {
          setHealth(data.health);
          setTimeLeft(data.timeLeft);
          if (data.isGameOver !== undefined) setIsGameOver(data.isGameOver);
          if (data.isPlaying !== undefined) setIsPlaying(data.isPlaying);
          if (data.gameResult !== undefined) setGameResult(data.gameResult);
        }
      } else if (data.type === 'pull') {
        if (isHost) {
          setHealth((prev) => {
            const next = Math.max(0, prev - 2);
            if (next <= 0) {
              endGame('guest_win');
              return 0;
            }
            return next;
          });
          // Guest pulled, trigger sparks
          createSparks();
        }
      } else if (data.type === 'gameover') {
        setIsGameOver(true);
        setIsPlaying(false);
        setGameResult(data.gameResult);
        if (data.health !== undefined) setHealth(data.health);
      }
    });

    es.addEventListener('game_canceled', () => {
      toast.error('Teammate left the game session.');
      exitGame();
    });

    es.addEventListener('game_rejected', () => {
      toast.error('Game invitation declined.');
      setMode('lobby');
      setInvitingPlayerId(null);
    });

    return () => {
      es.close();
    };
  }, [gameSession, token, isHost]);

  // Host state broadcaster (Syncs health/time/status to Guest)
  useEffect(() => {
    if (!gameSession || gameSession.gameType !== 'tug_of_war' || !isHost || !isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      api.post('/game/sync', {
        gameId: gameSession.id,
        type: 'state',
        health,
        timeLeft,
        isPlaying,
        isGameOver,
        gameResult
      }).catch(() => {});
    }, 40);

    return () => clearInterval(interval);
  }, [gameSession, isHost, isPlaying, isGameOver, health, timeLeft, gameResult]);

  // Invite player trigger
  const handleInvitePlayer = async (guestId) => {
    setInvitingPlayerId(guestId);
    setInviteStatus('waiting');
    try {
      const { data } = await api.post('/game/invite', { guestId, gameType: 'tug_of_war' });
      setGameSession({ id: data.gameId, hostId: currentUser.id, hostName: currentUser.name, gameType: 'tug_of_war' });
    } catch (err) {
      toast.error('Failed to send invitation. Teammate might be offline.');
      setInvitingPlayerId(null);
    }
  };

  // Decline/Cancel current invitation or leave session
  const exitGame = () => {
    if (gameSession) {
      api.post('/game/cancel', { gameId: gameSession.id }).catch(() => {});
    }
    setGameSession(null);
    setIsPlaying(false);
    setIsGameOver(false);
    setMode('lobby');
    setInvitingPlayerId(null);
  };

  // Get color formatting for the bar
  const getBarColors = () => {
    if (health < 25) return 'from-red-500 to-red-600 shadow-red-500/20';
    if (health < 50) return 'from-amber-500 to-amber-600 shadow-amber-500/20';
    return 'from-brand-teal to-[#2dd4bf] shadow-brand-teal/20';
  };

  return (
    <div className={standalone ? "flex-1 flex flex-col items-center justify-center p-6 md:p-8 bg-[#0b1413] text-[#e2e8f0] h-full overflow-y-auto" : "w-full flex flex-col items-center"}>
      {/* Title block */}
      {standalone && (
        <div className="w-full max-w-2xl flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-inner">
              <Zap className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight leading-none">Server Tug of War</h1>
              <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider mt-1">Stress-Buster Button Mashing Game</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="text-[#64748b] hover:text-white p-2 rounded-xl transition-all"
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
            </button>
            <button 
              onClick={() => {
                exitGame();
                onClose();
              }}
              className="text-[#64748b] hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all"
              title="Back to Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {mode === 'lobby' ? (
        /* --- MULTIPLAYER & SOLO LOBBY --- */
        <div className="w-full max-w-2xl bg-[#0f2421] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 shadow-2xl">
          {/* Left panel: Solo Play */}
          <div className="flex-1 bg-[#0b1311] border border-white/5 p-6 rounded-2xl flex flex-col justify-between items-center text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-inner">
                <Zap className="w-6 h-6 text-brand-teal animate-pulse" />
              </div>
              <h2 className="text-white text-lg font-extrabold tracking-tight">Single Player SLA</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-semibold">
                Mash SPACEBAR or click Resolve! rapidly to stabilize the server health against relentless traffic.
              </p>
            </div>
            <button
              onClick={() => {
                setMode('single');
                startGame();
              }}
              className="mt-6 w-full bg-[#2dd4bf]/15 hover:bg-[#2dd4bf]/25 border border-[#2dd4bf]/30 text-[#2dd4bf] font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-inner"
            >
              Play Solo SLA Mission
              <Play className="w-3.5 h-3.5 fill-[#2dd4bf]" />
            </button>
          </div>

          {/* Right panel: Invite Teammates */}
          <div className="flex-1 bg-[#0b1311] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/5 pb-2">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Online Teammates</span>
              </div>
              
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {teammates.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-4 text-center">No other active teammates online.</p>
                ) : (
                  teammates.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-brand-green animate-pulse' : 'bg-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{user.name}</span>
                      </div>
                      <button
                        onClick={() => handleInvitePlayer(user.id)}
                        disabled={invitingPlayerId !== null}
                        className="bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-40 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg transition-all"
                      >
                        {invitingPlayerId === user.id ? 'Invited' : 'Invite'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-slate-500 font-semibold leading-relaxed">
              🎮 Multi-player sends game invites via team SSE. P1 acts as Stabilizer (Health to 100%) and P2 acts as Cracker (Health to 0%).
            </div>
          </div>
        </div>
      ) : mode === 'multiplayer_waiting' || (invitingPlayerId && !gameSession?.guestName) ? (
        /* --- INVITE WAITING SPINNER --- */
        <div className="w-full max-w-2xl bg-[#0f2421] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl">
          <Loader2 className="w-12 h-12 text-[#2dd4bf] animate-spin mb-4" />
          <h2 className="text-white text-lg font-black tracking-tight">SLA Invitation Dispatched</h2>
          <p className="text-slate-400 text-xs max-w-xs mt-1 leading-relaxed font-semibold">
            Waiting for your teammate to accept the invitation...
          </p>
          <button
            onClick={exitGame}
            className="mt-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all"
          >
            Cancel Invitation
          </button>
        </div>
      ) : (
        /* --- Main Game Container --- */
        <div className="relative w-full max-w-2xl bg-[#0f2421] border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl shadow-black/80">
          
          {/* Close button if not standalone (StressBuster tabs) to exit match */}
          {!standalone && (
            <button
              onClick={exitGame}
              className="absolute top-4 right-4 text-[#64748b] hover:text-white p-2 rounded-xl transition-all"
              title="Exit Match"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Top: Timer */}
          <div className="w-full flex items-center justify-between mb-8 bg-[#0b1311] px-6 py-3.5 rounded-2xl border border-white/5">
            <span className="text-xs font-bold text-slate-400">
              {mode === 'multiplayer_active' ? 'Dual Power SLA Grid' : 'Incoming Traffic Level'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Time SLA</span>
              <div className={`px-4 py-1 rounded-xl text-sm font-black border tracking-wider shadow-inner ${
                timeLeft <= 5 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
                  : 'bg-brand-teal/10 border-brand-teal/20 text-[#2dd4bf]'
              }`}>
                {timeLeft}s
              </div>
            </div>
          </div>

          {/* Center Game Board */}
          <div className="w-full bg-[#081311] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center relative min-h-[280px]">
            
            {/* Label status indicators */}
            <div className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-2">
              {mode === 'multiplayer_active' ? (
                <>
                  <span className={`${health < 30 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                    🔴 CRACKER: {gameSession?.guestName}
                  </span>
                  <span className="text-white bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    SLA Health: <strong className={health < 30 ? 'text-red-400' : 'text-[#2dd4bf]'}>{Math.round(health)}%</strong>
                  </span>
                  <span className={`${health > 80 ? 'text-[#2dd4bf] animate-pulse' : 'text-slate-500'}`}>
                    🟢 STABILIZER: {gameSession?.hostName}
                  </span>
                </>
              ) : (
                <>
                  <span className={`${health < 30 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>CRASHED (0%)</span>
                  <span className="text-white bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    Server Health: <strong className={health < 30 ? 'text-red-400' : 'text-[#2dd4bf]'}>{Math.round(health)}%</strong>
                  </span>
                  <span className={`${health > 80 ? 'text-[#2dd4bf] animate-pulse' : 'text-slate-500'}`}>STABILIZED (100%)</span>
                </>
              )}
            </div>

            {/* Large horizontal Progress Bar (The Rope) */}
            <div className="w-full h-8 bg-black/40 rounded-full p-1 border border-white/5 shadow-inner relative overflow-hidden">
              {/* 50% Center SLA Line indicator */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l border-white/20 z-10 pointer-events-none" />
              
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-75 shadow-lg ${getBarColors()}`}
                style={{ width: `${health}%` }}
              />
            </div>

            {/* Center mashing instruction */}
            <p className="text-[#64748b] text-[10px] font-extrabold tracking-wider uppercase mt-4 text-center">
              {mode === 'multiplayer_active'
                ? isHost 
                  ? 'pull the health to 100% to stabilize!' 
                  : 'pull the health to 0% to crack the system!'
                : 'relentless system load is draining server health!'}
            </p>

            {/* Game controls / giant button */}
            <div className="relative mt-8 flex items-center justify-center">
              {/* Sparks render relative to button */}
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="absolute w-2 h-2 rounded-full pointer-events-none bg-brand-teal"
                  style={{
                    transform: `translate(${p.x}px, ${p.y}px)`,
                    opacity: p.alpha,
                    width: p.size,
                    height: p.size,
                  }}
                />
              ))}

              <button
                onClick={handleResolve}
                disabled={!isPlaying || isGameOver}
                className={`w-28 h-28 rounded-full border-4 border-white/10 font-black text-xs uppercase tracking-wider transition-all shadow-2xl flex flex-col items-center justify-center select-none cursor-pointer ${
                  clickEffect ? 'scale-90 opacity-90' : 'scale-100 active:scale-95'
                } ${
                  isPlaying && !isGameOver
                    ? 'bg-gradient-to-b from-[#2dd4bf] to-[#0d9488] text-white shadow-[#2dd4bf]/20'
                    : 'bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                }`}
              >
                <Zap className="w-6 h-6 mb-1 fill-white" />
                {mode === 'multiplayer_active' 
                  ? isHost 
                    ? 'STABILIZE!' 
                    : 'CRACK!'
                  : 'Resolve!'}
              </button>
            </div>

            <p className="text-slate-400 text-xs font-semibold mt-4">
              Click the button or mash <kbd className="bg-white/10 border border-white/15 px-2 py-0.5 rounded text-[10px] font-bold">SPACEBAR</kbd> rapidly!
            </p>

            {/* Welcome Screen Overlay */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-[#081311]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal mb-4 animate-bounce">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-white text-xl font-extrabold mb-1.5 tracking-tight">System Tug of War</h2>
                <p className="text-[#64748b] text-xs font-medium max-w-sm mb-6 leading-relaxed">
                  Relentless background traffic is dragging Server Health to 0%. 
                  Mash <span className="text-brand-teal font-extrabold">SPACEBAR</span> or click Resolve! rapidly to stabilize the server!
                </p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#00ad9c] text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-brand-teal/20 transition-all hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Initialize SLA Response
                </button>
              </div>
            )}

            {/* Game Over Screen Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-[#081311]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-in fade-in duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  gameResult === 'win' || (mode === 'multiplayer_active' && ((isHost && gameResult === 'host_win') || (!isHost && gameResult === 'guest_win')))
                    ? 'bg-brand-green/20 border border-brand-green/40 text-brand-green' 
                    : 'bg-red-500/20 border border-red-500/40 text-red-500'
                }`}>
                  {gameResult === 'win' || (mode === 'multiplayer_active' && ((isHost && gameResult === 'host_win') || (!isHost && gameResult === 'guest_win')))
                    ? <Trophy className="w-7 h-7" /> 
                    : <AlertTriangle className="w-7 h-7" />}
                </div>
                <h2 className="text-white text-2xl font-black mb-1 tracking-tight uppercase">SLA Terminated</h2>
                
                <p className={`text-lg font-black mb-6 ${
                  gameResult === 'win' || (mode === 'multiplayer_active' && ((isHost && gameResult === 'host_win') || (!isHost && gameResult === 'guest_win')))
                    ? 'text-brand-green' 
                    : 'text-red-400'
                }`}>
                  {mode === 'multiplayer_active' ? (
                    gameResult === 'host_win'
                      ? `Stabilizer ${gameSession?.hostName} Wins! 🏆`
                      : gameResult === 'guest_win'
                        ? `System Cracker ${gameSession?.guestName} Wins! 💥`
                        : "Match ended in a Draw! ⏳"
                  ) : (
                    <>
                      {gameResult === 'win' && 'Server Stabilized! 🏆'}
                      {gameResult === 'lose' && 'Server Crashed! 💥'}
                      {gameResult === 'timeout' && 'SLA Timeout! ⏳'}
                    </>
                  )}
                </p>

                {mode === 'multiplayer_active' ? (
                  <button
                    onClick={exitGame}
                    className="flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#00ad9c] text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-brand-teal/20 transition-all hover:-translate-y-0.5"
                  >
                    <X className="w-4 h-4" />
                    Exit Match
                  </button>
                ) : (
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#00ad9c] text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-brand-teal/20 transition-all hover:-translate-y-0.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resolve Again
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Info footer */}
          <div className="w-full mt-4 text-center text-xs text-[#64748b] font-bold">
            {mode === 'multiplayer_active' ? (
              <span>Active players: {gameSession?.hostName} (Stabilizer) vs {gameSession?.guestName} (Cracker)</span>
            ) : (
              <span>Active server instances monitored: 5 | Drain rate: 15%/s</span>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Play button icon
function Play({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
