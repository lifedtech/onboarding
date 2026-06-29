import { useEffect, useRef, useState } from 'react';
import { Shield, Trophy, RotateCcw, Play, AlertTriangle, X, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../../lib/axios';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function TicketDeflector({ onClose, gameSession, setGameSession, standalone = true }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('lobby'); // 'lobby' | 'single' | 'multiplayer_waiting' | 'multiplayer_active'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerScore, setPlayerScore] = useState(0);
  const [systemScore, setSystemScore] = useState(0);
  const [winnerMessage, setWinnerMessage] = useState('');
  
  // Lobby list
  const [teammates, setTeammates] = useState([]);
  const [invitingPlayerId, setInvitingPlayerId] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(''); // 'waiting' | 'declined'

  const currentUser = useOpsStore((s) => s.user);
  const token = useOpsStore((s) => s.token);
  const isHost = gameSession ? gameSession.hostId === currentUser?.id : true;

  // Audio helper
  const playBeep = (freq, type = 'sine', duration = 0.1) => {
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

  // References to keep mutable values for the requestAnimationFrame loop
  const gameStateRef = useRef({
    ball: { x: 300, y: 200, vx: 0, vy: 0, radius: 8, speed: 5 },
    playerPaddle: { x: 20, y: 160, width: 12, height: 80 },
    aiPaddle: { x: 568, y: 160, width: 12, height: 80 },
    particles: [],
    mouseY: 200,
  });

  // Track mouse coordinates on canvas
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    gameStateRef.current.mouseY = e.clientY - rect.top;
  };

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(60);
    setPlayerScore(0);
    setSystemScore(0);
    
    // Reset velocities and position
    resetBall(true);
    
    playBeep(440, 'triangle', 0.2);
    setTimeout(() => playBeep(880, 'sine', 0.1), 100);
  };

  // Reset ball position and apply velocity
  const resetBall = (startNew = false) => {
    const state = gameStateRef.current;
    state.ball.x = 300;
    state.ball.y = 200;
    state.ball.speed = 5.5;

    // Send the ball in a random direction towards player or AI
    const goLeft = startNew ? Math.random() < 0.5 : state.ball.vx > 0;
    const angle = (Math.random() * 2 - 1) * (Math.PI / 6); // max 30 degrees angle
    state.ball.vx = (goLeft ? -1 : 1) * state.ball.speed * Math.cos(angle);
    state.ball.vy = state.ball.speed * Math.sin(angle);
  };

  // Create sparks
  const createSparks = (x, y, color) => {
    const state = gameStateRef.current;
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: Math.random() * 3 + 1,
      });
    }
  };

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
    if (gameSession) {
      setMode('multiplayer_active');
      setIsPlaying(true);
      setIsGameOver(false);
      setTimeLeft(60);
      setPlayerScore(0);
      setSystemScore(0);
      resetBall(true);
    }
  }, [gameSession]);

  // Online Multiplayer SSE Synchronizer
  useEffect(() => {
    if (!gameSession || !token) return;

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const es = new EventSource(url);

    es.addEventListener('game_sync', (event) => {
      const data = JSON.parse(event.data);
      const state = gameStateRef.current;

      if (data.type === 'ball_and_paddle') {
        if (!isHost) {
          // Guest updates ball from Host's physics engine sync
          state.ball.x = data.ball.x;
          state.ball.y = data.ball.y;
          state.ball.vx = data.ball.vx;
          state.ball.vy = data.ball.vy;
          state.ball.speed = data.ball.speed;
          state.playerPaddle.y = data.paddleY; // Left paddle Y (Host)
          
          if (data.playerScore !== undefined) setPlayerScore(data.playerScore);
          if (data.systemScore !== undefined) setSystemScore(data.systemScore);
        }
      } else if (data.type === 'paddle') {
        if (isHost) {
          // Host updates Guest paddle Y
          state.aiPaddle.y = data.paddleY; // Right paddle Y (Guest)
        }
      } else if (data.type === 'gameover') {
        setIsGameOver(true);
        setIsPlaying(false);
        setWinnerMessage(data.winnerMessage);
        if (data.playerScore !== undefined) setPlayerScore(data.playerScore);
        if (data.systemScore !== undefined) setSystemScore(data.systemScore);
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

  // Host state broadcaster (Syncs ball and left paddle to Guest)
  useEffect(() => {
    if (!gameSession || !isHost || !isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      const state = gameStateRef.current;
      api.post('/game/sync', {
        gameId: gameSession.id,
        type: 'ball_and_paddle',
        ball: {
          x: state.ball.x,
          y: state.ball.y,
          vx: state.ball.vx,
          vy: state.ball.vy,
          speed: state.ball.speed,
        },
        paddleY: state.playerPaddle.y,
        playerScore,
        systemScore,
      }).catch(() => {});
    }, 40);

    return () => clearInterval(interval);
  }, [gameSession, isHost, isPlaying, isGameOver, playerScore, systemScore]);

  // Guest state broadcaster (Syncs right paddle to Host)
  useEffect(() => {
    if (!gameSession || isHost || !isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      const state = gameStateRef.current;
      api.post('/game/sync', {
        gameId: gameSession.id,
        type: 'paddle',
        paddleY: state.aiPaddle.y, // Guest controls right paddle
      }).catch(() => {});
    }, 40);

    return () => clearInterval(interval);
  }, [gameSession, isHost, isPlaying, isGameOver]);

  // Main Canvas Render and Physics Loop
  useEffect(() => {
    if (mode === 'lobby' || mode === 'multiplayer_waiting') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const updateGame = () => {
      const state = gameStateRef.current;
      const { ball, playerPaddle, aiPaddle, particles } = state;

      if (mode === 'single') {
        // --- Single Player Logic ---
        // 1. Move Player paddle (smooth easing)
        const targetPlayerY = state.mouseY - playerPaddle.height / 2;
        playerPaddle.y += (targetPlayerY - playerPaddle.y) * 0.22;
        playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));

        // 2. Move CPU paddle (lagged tracking)
        const aiSpeed = Math.min(4.2, state.ball.speed * 0.65);
        const targetAiY = ball.y - aiPaddle.height / 2;
        const diffY = targetAiY - aiPaddle.y;
        if (Math.abs(diffY) > 4) {
          aiPaddle.y += Math.sign(diffY) * Math.min(Math.abs(diffY), aiSpeed);
        }
        aiPaddle.y = Math.max(0, Math.min(canvas.height - aiPaddle.height, aiPaddle.y));

        // 3. Move Ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // 4. Wall collisions (Top/Bottom)
        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
          playBeep(330, 'sine', 0.05);
        } else if (ball.y + ball.radius >= canvas.height) {
          ball.y = canvas.height - ball.radius;
          ball.vy = -ball.vy;
          playBeep(330, 'sine', 0.05);
        }

        // 5. Paddle Collision (Player - Left)
        if (
          ball.vx < 0 &&
          ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
          ball.x + ball.radius >= playerPaddle.x &&
          ball.y >= playerPaddle.y &&
          ball.y <= playerPaddle.y + playerPaddle.height
        ) {
          const relativeIntersectY = (playerPaddle.y + playerPaddle.height / 2) - ball.y;
          const normalizedIntersectY = relativeIntersectY / (playerPaddle.height / 2);
          const bounceAngle = normalizedIntersectY * (Math.PI / 3.5);

          ball.speed = Math.min(15, ball.speed + 0.45);
          ball.vx = ball.speed * Math.cos(bounceAngle);
          ball.vy = -ball.speed * Math.sin(bounceAngle);

          createSparks(playerPaddle.x + playerPaddle.width, ball.y, '#2dd4bf');
          playBeep(520, 'triangle', 0.08);
        }

        // 6. Paddle Collision (CPU - Right)
        if (
          ball.vx > 0 &&
          ball.x + ball.radius >= aiPaddle.x &&
          ball.x - ball.radius <= aiPaddle.x + aiPaddle.width &&
          ball.y >= aiPaddle.y &&
          ball.y <= aiPaddle.y + aiPaddle.height
        ) {
          const relativeIntersectY = (aiPaddle.y + aiPaddle.height / 2) - ball.y;
          const normalizedIntersectY = relativeIntersectY / (aiPaddle.height / 2);
          const bounceAngle = normalizedIntersectY * (Math.PI / 3.5);

          ball.speed = Math.min(15, ball.speed + 0.45);
          ball.vx = -ball.speed * Math.cos(bounceAngle);
          ball.vy = -ball.speed * Math.sin(bounceAngle);

          createSparks(aiPaddle.x, ball.y, '#f43f5e');
          playBeep(580, 'triangle', 0.08);
        }

        // 7. Goals
        if (ball.x < 0) {
          setSystemScore((prev) => prev + 1);
          createSparks(15, ball.y, '#ef4444');
          playBeep(220, 'sawtooth', 0.25);
          resetBall();
        } else if (ball.x > canvas.width) {
          setPlayerScore((prev) => prev + 1);
          createSparks(canvas.width - 15, ball.y, '#2dd4bf');
          playBeep(660, 'sine', 0.18);
          setTimeout(() => playBeep(880, 'sine', 0.12), 80);
          resetBall();
        }
      } else if (mode === 'multiplayer_active') {
        // --- Online Multiplayer Logic ---
        if (isHost) {
          // Host controls Left paddle (Mouse) and processes Ball physics
          const targetPlayerY = state.mouseY - playerPaddle.height / 2;
          playerPaddle.y += (targetPlayerY - playerPaddle.y) * 0.22;
          playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));

          // Move Ball
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall collisions
          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy;
            playBeep(330, 'sine', 0.05);
          } else if (ball.y + ball.radius >= canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.vy = -ball.vy;
            playBeep(330, 'sine', 0.05);
          }

          // Paddle Collision (Host Left Paddle)
          if (
            ball.vx < 0 &&
            ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
            ball.x + ball.radius >= playerPaddle.x &&
            ball.y >= playerPaddle.y &&
            ball.y <= playerPaddle.y + playerPaddle.height
          ) {
            const relativeIntersectY = (playerPaddle.y + playerPaddle.height / 2) - ball.y;
            const normalizedIntersectY = relativeIntersectY / (playerPaddle.height / 2);
            const bounceAngle = normalizedIntersectY * (Math.PI / 3.5);

            ball.speed = Math.min(15, ball.speed + 0.45);
            ball.vx = ball.speed * Math.cos(bounceAngle);
            ball.vy = -ball.speed * Math.sin(bounceAngle);

            createSparks(playerPaddle.x + playerPaddle.width, ball.y, '#2dd4bf');
            playBeep(520, 'triangle', 0.08);
          }

          // Paddle Collision (Guest Right Paddle)
          if (
            ball.vx > 0 &&
            ball.x + ball.radius >= aiPaddle.x &&
            ball.x - ball.radius <= aiPaddle.x + aiPaddle.width &&
            ball.y >= aiPaddle.y &&
            ball.y <= aiPaddle.y + aiPaddle.height
          ) {
            const relativeIntersectY = (aiPaddle.y + aiPaddle.height / 2) - ball.y;
            const normalizedIntersectY = relativeIntersectY / (aiPaddle.height / 2);
            const bounceAngle = normalizedIntersectY * (Math.PI / 3.5);

            ball.speed = Math.min(15, ball.speed + 0.45);
            ball.vx = -ball.speed * Math.cos(bounceAngle);
            ball.vy = -ball.speed * Math.sin(bounceAngle);

            createSparks(aiPaddle.x, ball.y, '#f43f5e');
            playBeep(580, 'triangle', 0.08);
          }

          // Goals
          if (ball.x < 0) {
            setSystemScore((prev) => prev + 1); // Guest got point (Right side)
            createSparks(15, ball.y, '#ef4444');
            playBeep(220, 'sawtooth', 0.25);
            resetBall();
          } else if (ball.x > canvas.width) {
            setPlayerScore((prev) => prev + 1); // Host got point (Left side)
            createSparks(canvas.width - 15, ball.y, '#2dd4bf');
            playBeep(660, 'sine', 0.18);
            setTimeout(() => playBeep(880, 'sine', 0.12), 80);
            resetBall();
          }
        } else {
          // Guest controls Right paddle (Mouse) and listens to Ball physics from Host
          const targetGuestY = state.mouseY - aiPaddle.height / 2;
          aiPaddle.y += (targetGuestY - aiPaddle.y) * 0.22;
          aiPaddle.y = Math.max(0, Math.min(canvas.height - aiPaddle.height, aiPaddle.y));
        }
      }

      // Update sparks/particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        if (p.alpha <= 0) particles.splice(i, 1);
      }
    };

    const drawGame = () => {
      const state = gameStateRef.current;
      const { ball, playerPaddle, aiPaddle, particles } = state;

      // Clear
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dash line
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.15)';
      ctx.lineWidth = 4;
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw background arcade score
      ctx.fillStyle = 'rgba(45, 212, 191, 0.1)';
      ctx.font = 'black 120px Montserrat, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const leftScore = mode === 'multiplayer_active' ? playerScore : playerScore;
      const rightScore = mode === 'multiplayer_active' ? systemScore : systemScore;
      ctx.fillText(leftScore, canvas.width * 0.25, canvas.height / 2);
      ctx.fillText(rightScore, canvas.width * 0.75, canvas.height / 2);

      // Left Paddle (Host - Teal)
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#2dd4bf';
      const playerGrad = ctx.createLinearGradient(playerPaddle.x, playerPaddle.y, playerPaddle.x, playerPaddle.y + playerPaddle.height);
      playerGrad.addColorStop(0, '#5eead4');
      playerGrad.addColorStop(1, '#0d9488');
      ctx.fillStyle = playerGrad;
      ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

      // Right Paddle (Guest/CPU - Red)
      ctx.shadowColor = '#f43f5e';
      const aiGrad = ctx.createLinearGradient(aiPaddle.x, aiPaddle.y, aiPaddle.x, aiPaddle.y + aiPaddle.height);
      aiGrad.addColorStop(0, '#f43f5e');
      aiGrad.addColorStop(1, '#be123c');
      ctx.fillStyle = aiGrad;
      ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);

      // Ball (Glowing green-lime)
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#a3e635';
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sparks
      ctx.shadowBlur = 0;
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    };

    const loop = () => {
      if (isPlaying && !isGameOver) {
        updateGame();
      }
      drawGame();
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, mode, playerScore, systemScore, isHost]);

  // Match Countdown Timer
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    // Only the Host calculates time updates in Multiplayer
    if (mode === 'multiplayer_active' && !isHost) return;

    if (timeLeft <= 0) {
      setIsGameOver(true);
      setIsPlaying(false);
      
      let msg = '';
      if (playerScore > systemScore) {
        msg = mode === 'single' ? 'SLA MET! You defeated the CPU!' : `VICTORY! ${gameSession.hostName} won the match!`;
        playBeep(523.25, 'sine', 0.15);
        setTimeout(() => playBeep(659.25, 'sine', 0.15), 150);
        setTimeout(() => playBeep(783.99, 'sine', 0.15), 300);
        setTimeout(() => playBeep(1046.50, 'sine', 0.4), 450);
      } else if (playerScore < systemScore) {
        msg = mode === 'single' ? 'SLA BREACHED! CPU won.' : `VICTORY! ${gameSession.guestName} won the match!`;
        playBeep(293.66, 'sawtooth', 0.2);
        setTimeout(() => playBeep(220.00, 'sawtooth', 0.4), 200);
      } else {
        msg = 'DRAW! Perfect SLA tie.';
        playBeep(330, 'triangle', 0.3);
      }
      
      setWinnerMessage(msg);

      // Host notifies Guest about game over
      if (mode === 'multiplayer_active' && isHost) {
        api.post('/game/sync', {
          gameId: gameSession.id,
          type: 'gameover',
          playerScore,
          systemScore,
          winnerMessage: msg,
        }).catch(() => {});
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        // Sync time occasionally
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, timeLeft, playerScore, systemScore, mode, isHost, gameSession]);

  // Invite player trigger
  const handleInvitePlayer = async (guestId) => {
    setInvitingPlayerId(guestId);
    setInviteStatus('waiting');
    try {
      const { data } = await api.post('/game/invite', { guestId });
      // Keep record of local gameId
      setGameSession({ id: data.gameId, hostId: currentUser.id, hostName: currentUser.name });
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={standalone ? "flex-1 flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50/50 text-text-main h-full overflow-y-auto font-sans" : "w-full flex flex-col items-center font-sans"}>
      {/* Title */}
      {standalone && (
        <div className="w-full max-w-2xl flex items-center justify-between mb-4 border-b border-border-leaf pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-sm">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-text-main font-black text-2xl tracking-tight leading-none">Ticket Deflector</h1>
              <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mt-1.5">Stress-Buster SLA Deflector Game</p>
            </div>
          </div>
          <button 
            onClick={() => {
              exitGame();
              onClose();
            }}
            className="text-slate-400 hover:text-text-main hover:bg-slate-100 p-2 rounded-[12px] transition-all"
            title="Back to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {mode === 'lobby' ? (
        /* --- MULTIPLAYER & SOLO LOBBY --- */
        <div className="w-full max-w-2xl bg-white border border-border-leaf rounded-[24px] p-6 flex flex-col md:flex-row gap-6 shadow-sm">
          {/* Left panel: Solo Play */}
          <div className="flex-1 bg-slate-50 border border-border-leaf p-6 rounded-[20px] flex flex-col justify-between items-center text-center shadow-sm">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-[16px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal mx-auto shadow-sm">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="text-text-main text-xl font-black tracking-tight">Single Player SLA</h2>
              <p className="text-slate-500 text-[13px] leading-relaxed max-w-xs font-semibold">
                Deflect incoming P1 tickets against a simulated system controller. Reaction speed builds up dynamically.
              </p>
            </div>
            <button
              onClick={() => {
                setMode('single');
                startGame();
              }}
              className="mt-6 w-full bg-brand-teal hover:bg-brand-teal-hover border border-transparent text-white font-black text-sm py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              Play Solo SLA Mission
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>

          {/* Right panel: Invite Teammates */}
          <div className="flex-1 bg-slate-50 border border-border-leaf p-6 rounded-[20px] flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-main font-black text-sm border-b border-border-leaf pb-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Online Teammates</span>
              </div>
              
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2">
                {teammates.length === 0 ? (
                  <p className="text-slate-400 text-xs italic py-6 text-center font-medium">No other active teammates online.</p>
                ) : (
                  teammates.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-white border border-border-leaf p-2.5 rounded-[16px] shadow-sm hover:border-brand-teal/30 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full border border-white shadow-sm ${user.isOnline ? 'bg-brand-green animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-xs font-black text-text-main truncate max-w-[120px] group-hover:text-brand-teal transition-colors">{user.name}</span>
                      </div>
                      <button
                        onClick={() => handleInvitePlayer(user.id)}
                        disabled={invitingPlayerId !== null}
                        className="bg-brand-teal/10 hover:bg-brand-teal/20 disabled:opacity-40 text-brand-teal font-extrabold text-[10px] px-3 py-1.5 rounded-[10px] transition-all"
                      >
                        {invitingPlayerId === user.id ? 'Invited' : 'Invite'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="border-t border-border-leaf pt-4 mt-5 text-[11px] text-slate-500 font-semibold leading-relaxed bg-brand-teal/5 p-3 rounded-[12px]">
              🎮 Multi-player sends game invites via team SSE connection. P1 hosts ball physics and coordinates coordinates to guest.
            </div>
          </div>
        </div>
      ) : mode === 'multiplayer_waiting' || (invitingPlayerId && !gameSession?.guestName) ? (
        /* --- INVITE WAITING SPINNER --- */
        <div className="w-full max-w-2xl bg-white border border-border-leaf rounded-[24px] p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin mb-4" />
          <h2 className="text-text-main text-xl font-black tracking-tight">SLA Invitation Dispatched</h2>
          <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed font-semibold">
            Waiting for your teammate to accept the invitation...
          </p>
          <button
            onClick={exitGame}
            className="mt-8 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 font-extrabold text-xs px-6 py-3 rounded-[16px] transition-all shadow-sm"
          >
            Cancel Invitation
          </button>
        </div>
      ) : (
        /* --- MAIN CANVAS BOARD --- */
        <div className="relative w-full max-w-2xl bg-white border border-border-leaf rounded-[24px] p-6 flex flex-col items-center shadow-sm">
          {/* Game Stats & Timer */}
          <div className="w-full flex items-center justify-between mb-5 bg-slate-50 px-5 py-4 rounded-[16px] border border-border-leaf shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Score</span>
              <div className="flex items-center gap-3 text-sm font-black bg-white border border-border-leaf px-3.5 py-1.5 rounded-[12px] shadow-sm">
                {mode === 'multiplayer_active' ? (
                  <>
                    <span className="text-brand-teal">{gameSession?.hostName}: {playerScore}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-500">{gameSession?.guestName}: {systemScore}</span>
                  </>
                ) : (
                  <>
                    <span className="text-brand-teal">You: {playerScore}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-500">CPU: {systemScore}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">SLA Timer</span>
              <div className={`px-4 py-1.5 rounded-[12px] text-sm font-black border shadow-sm ${
                timeLeft <= 10 
                  ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                  : 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-[20px] border border-border-leaf bg-slate-50 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseMove={handleMouseMove}
              className={`w-full h-full cursor-none block ${!isPlaying && 'opacity-50'}`}
            />

            {/* Welcome/Start single player */}
            {!isPlaying && !isGameOver && mode === 'single' && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-[20px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal mb-4 animate-bounce shadow-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-text-main text-2xl font-black mb-2 tracking-tight">Deflect the P1 Tickets</h2>
                <p className="text-slate-500 text-[13px] font-semibold max-w-sm mb-8 leading-relaxed">
                  Move your mouse to control the <span className="text-brand-teal font-black">Left Paddle</span>. 
                  Deflect tickets back to the CPU. Speed increases with each deflection.
                </p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-8 py-4 rounded-[16px] text-sm font-black shadow-sm transition-all hover:shadow-md hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start SLA Mission
                </button>
              </div>
            )}

            {/* Game Over overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-5 shadow-sm ${
                  playerScore > systemScore 
                    ? 'bg-brand-teal/10 border border-brand-teal/20 text-brand-teal' 
                    : 'bg-red-50 border border-red-200 text-red-500'
                }`}>
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-text-main text-2xl font-black mb-2 tracking-tight uppercase">SLA Cycle Over</h2>
                <p className="text-brand-teal text-lg font-black mb-6 px-6">
                  {winnerMessage}
                </p>
                
                <div className="bg-slate-50 border border-border-leaf px-8 py-4 rounded-[16px] text-[13px] font-bold text-slate-500 mb-8 flex items-center gap-6 shadow-sm">
                  {mode === 'multiplayer_active' ? (
                    <>
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider">{gameSession?.hostName}</span>
                        <strong className="text-text-main text-xl font-black">{playerScore}</strong>
                      </span>
                      <span className="text-border-leaf text-2xl">|</span>
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider">{gameSession?.guestName}</span>
                        <strong className="text-text-main text-xl font-black">{systemScore}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider">Your Resolves</span>
                        <strong className="text-text-main text-xl font-black">{playerScore}</strong>
                      </span>
                      <span className="text-border-leaf text-2xl">|</span>
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider">CPU Breaches</span>
                        <strong className="text-text-main text-xl font-black">{systemScore}</strong>
                      </span>
                    </>
                  )}
                </div>

                {mode === 'single' ? (
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-8 py-3.5 rounded-[16px] text-sm font-black shadow-sm transition-all hover:shadow-md hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Deflect Again
                  </button>
                ) : (
                  <button
                    onClick={exitGame}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-text-main px-8 py-3.5 rounded-[16px] text-sm font-black shadow-sm transition-all hover:shadow-md hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Exit Match
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action controls */}
          <div className="w-full mt-6 flex items-center justify-between text-[11px] text-slate-500 font-extrabold tracking-wide uppercase">
            {mode === 'multiplayer_active' ? (
              <span>
                {isHost 
                  ? 'Controls: Move mouse to deflect Left Paddle' 
                  : 'Controls: Move mouse to deflect Right Paddle'}
              </span>
            ) : (
              <span>Control: Mouse movement controls Left Paddle</span>
            )}
            
            <button
              onClick={exitGame}
              className="text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-[12px] border border-red-200 hover:border-red-500 transition-all shadow-sm"
            >
              Abort Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
