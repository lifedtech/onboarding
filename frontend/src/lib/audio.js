// ─── Shared Audio Utility ──────────────────────────────────────────────────────
// Singleton AudioContext that gets unlocked on the first user gesture.
// Browsers block audio until user interaction — this pattern handles it reliably.

let _ctx = null;

const getCtx = () => {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
};

// Unlock the AudioContext on first user gesture (click or keydown).
// Must be called once at app startup.
export const initAudio = () => {
  const unlock = () => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (_) {}
    document.removeEventListener('click',   unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('click',      unlock, { once: true });
  document.addEventListener('keydown',    unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true });
};

// Play a short two-tone notification ping.
export const playNotificationSound = () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // First tone — high
    const osc1  = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046, ctx.currentTime);       // C6
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.18);

    // Second tone — lower, slightly delayed
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.12); // G5
    gain2.gain.setValueAtTime(0.13, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.38);
  } catch (_) { /* audio blocked or unavailable */ }
};
