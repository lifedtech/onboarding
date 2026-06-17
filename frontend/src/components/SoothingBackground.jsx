import React, { useRef, useEffect } from 'react';

export default function SoothingBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Track mouse positioning with spring physics interpolation
    const mouse = {
      x: null,
      y: null,
      targetX: null,
      targetY: null,
      active: false,
      glowX: null,
      glowY: null,
    };

    // Responsive setup
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Drifting Blobs Config
    const blobs = [
      {
        baseX: width * 0.2,
        baseY: height * 0.25,
        x: width * 0.2,
        y: height * 0.25,
        radius: Math.max(width, height) * 0.35,
        colorStart: 'rgba(120, 198, 82, 0.15)', // Soft Green
        colorEnd: 'rgba(120, 198, 82, 0)',
        speedX: 0.0007,
        speedY: 0.0005,
        ampX: 120,
        ampY: 90,
        offsetX: Math.random() * 100,
        offsetY: Math.random() * 100,
      },
      {
        baseX: width * 0.8,
        baseY: height * 0.75,
        x: width * 0.8,
        y: height * 0.75,
        radius: Math.max(width, height) * 0.4,
        colorStart: 'rgba(0, 176, 155, 0.15)', // Soft Teal
        colorEnd: 'rgba(0, 176, 155, 0)',
        speedX: 0.0006,
        speedY: 0.0008,
        ampX: 150,
        ampY: 100,
        offsetX: Math.random() * 100,
        offsetY: Math.random() * 100,
      },
      {
        baseX: width * 0.35,
        baseY: height * 0.7,
        x: width * 0.35,
        y: height * 0.7,
        radius: Math.max(width, height) * 0.3,
        colorStart: 'rgba(44, 62, 80, 0.08)', // Soft Slate/Midnight Blue
        colorEnd: 'rgba(44, 62, 80, 0)',
        speedX: 0.0009,
        speedY: 0.0004,
        ampX: 100,
        ampY: 130,
        offsetX: Math.random() * 100,
        offsetY: Math.random() * 100,
      },
    ];

    // Floating Particles (Motes) Config
    const particleCount = 35;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseSpeedY: 0.3 + Math.random() * 0.5,
        speedY: 0.3 + Math.random() * 0.5,
        baseSpeedX: -0.1 + Math.random() * 0.2,
        speedX: -0.1 + Math.random() * 0.2,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.35,
        baseAlpha: 0.15 + Math.random() * 0.35,
        pulseSpeed: 0.005 + Math.random() * 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        // Particle repulsion forces
        forceX: 0,
        forceY: 0,
      });
    }

    // Ripple click rings
    let ripples = [];

    const handleClick = (e) => {
      // Spawn two offset rings for extra liquidity
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.45,
        speed: 3.5,
        opacity: 0.75,
        decay: 0.982,
        color: '0, 176, 155', // Teal
        lineWidth: 3,
      });
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.35,
        speed: 2.5,
        opacity: 0.5,
        decay: 0.978,
        color: '120, 198, 82', // Green warm glow secondary ring
        lineWidth: 2,
      });
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      if (mouse.glowX === null) {
        mouse.glowX = e.clientX;
        mouse.glowY = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Base Calm Background Color
      ctx.fillStyle = '#edf0f2';
      ctx.fillRect(0, 0, width, height);

      // 2. Render Morphing/Drifting Fluid Blobs
      blobs.forEach((blob) => {
        // Compute slow drifting coordinate based on elapsed time
        blob.x = blob.baseX + Math.sin(timestamp * blob.speedX + blob.offsetX) * blob.ampX;
        blob.y = blob.baseY + Math.cos(timestamp * blob.speedY + blob.offsetY) * blob.ampY;

        // Draw soft radial blur blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        gradient.addColorStop(0, blob.colorStart);
        gradient.addColorStop(0.5, blob.colorStart.replace(/[\d.]+\)$/, '0.25)'));
        gradient.addColorStop(1, blob.colorEnd);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Render Mouse Aura (Spring Physics follow)
      if (mouse.active && mouse.targetX !== null) {
        // Slow spring follow
        mouse.glowX += (mouse.targetX - mouse.glowX) * 0.06;
        mouse.glowY += (mouse.targetY - mouse.glowY) * 0.06;

        const mouseGlow = ctx.createRadialGradient(
          mouse.glowX, mouse.glowY, 0,
          mouse.glowX, mouse.glowY, 220
        );
        mouseGlow.addColorStop(0, 'rgba(0, 176, 155, 0.045)');
        mouseGlow.addColorStop(0.5, 'rgba(0, 176, 155, 0.015)');
        mouseGlow.addColorStop(1, 'rgba(0, 176, 155, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.glowX, mouse.glowY, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Render Drifting & Interactive Particles (Motes)
      particles.forEach((p) => {
        // Apply smooth floating movements
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(timestamp * 0.001 + p.pulseOffset) * 0.15;

        // Recycle particle if it exits the viewport top/bottom/sides
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Interaction with mouse (repulsion)
        if (mouse.active && mouse.targetX !== null) {
          const dx = p.x - mouse.targetX;
          const dy = p.y - mouse.targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const limitDist = 140;

          if (dist < limitDist) {
            // Push away proportional to distance
            const force = (limitDist - dist) / limitDist;
            const pushX = (dx / dist) * force * 1.8;
            const pushY = (dy / dist) * force * 1.8;

            p.forceX += (pushX - p.forceX) * 0.1;
            p.forceY += (pushY - p.forceY) * 0.1;
          } else {
            // Slow return to normal
            p.forceX *= 0.92;
            p.forceY *= 0.92;
          }
        } else {
          p.forceX *= 0.92;
          p.forceY *= 0.92;
        }

        // Apply force offsets
        p.x += p.forceX;
        p.y += p.forceY;

        // Soft opacity pulse
        const pulse = Math.sin(timestamp * p.pulseSpeed + p.pulseOffset);
        const currentAlpha = Math.max(0.05, p.baseAlpha + pulse * 0.1);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 176, 155, ${currentAlpha * 0.6})`;
        ctx.shadowColor = 'rgba(0, 176, 155, 0.1)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 5. Update and Draw Click Ripples
      ripples = ripples.filter((ripple) => {
        ripple.radius += ripple.speed;
        ripple.opacity *= ripple.decay;

        if (ripple.opacity > 0.01) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${ripple.color}, ${ripple.opacity})`;
          ctx.lineWidth = ripple.lineWidth * ripple.opacity;
          ctx.stroke();
          return true;
        }
        return false;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

