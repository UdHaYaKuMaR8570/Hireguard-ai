import React, { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';

/**
 * Creative Cinematic Opening Experience (`CinematicIntro.jsx`)
 * Displays storytelling captions at the bottom during the animation phase,
 * and centers the HIREGUARD® AI brand reveal dead in the middle of the screen during Phase 4.
 */
const CinematicIntro = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(1);
  const [opacity, setOpacity] = useState(1);

  const copyText = [
    "", // Phase 0
    "In an ocean of fake job offers, ghost recruiters, and hidden traps...",
    "AI Neural Scanning exposes counterfeit entities before you apply.",
    "Graph Intelligence neutralizes fraud networks across 2,400+ nodes.",
    "HIREGUARD® AI — Trust Before You Apply."
  ];

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase(2); }, 2800);
    const t2 = setTimeout(() => { setPhase(3); }, 5600);
    const t3 = setTimeout(() => { setPhase(4); }, 8200);
    const t4 = setTimeout(() => { setOpacity(0); }, 10800);
    const t5 = setTimeout(() => { if (onComplete) onComplete(); }, 11800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // 60 FPS HTML5 Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating Stipple Particles
    const particleCount = 90;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 0.8,
        y: (Math.random() - 0.5) * height * 0.8,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2 + 1,
        isScam: i % 3 === 0
      });
    }

    let frame = 0;
    let scanY = 0;

    const render = () => {
      // Pitch Black Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      frame += 0.02;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Render Hand-Drawn Woodcut Skull Artwork in Phase 1, 2, 3
      if (phase < 4) {
        ctx.rotate(Math.sin(frame * 0.5) * 0.04);

        ctx.strokeStyle = '#e2ded4';
        ctx.fillStyle = '#e2ded4';
        ctx.lineWidth = 2;

        // 1. Skull Cranium Outline
        ctx.beginPath();
        ctx.ellipse(0, -30, 80, 95, 0, Math.PI * 0.15, Math.PI * 0.85, true);
        ctx.stroke();

        // 2. Cheekbones & Jaw
        ctx.beginPath();
        ctx.moveTo(-75, -15);
        ctx.quadraticCurveTo(-90, 15, -65, 35);
        ctx.lineTo(-45, 35);
        ctx.lineTo(-45, 60);
        ctx.lineTo(45, 60);
        ctx.lineTo(45, 35);
        ctx.lineTo(65, 35);
        ctx.quadraticCurveTo(90, 15, 75, -15);
        ctx.stroke();

        // 3. Eye Sockets
        ctx.beginPath();
        ctx.ellipse(-32, -15, 20, 26, Math.PI * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(32, -15, 20, 26, -Math.PI * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.stroke();

        // 4. Nasal Cavity
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(-12, 28);
        ctx.lineTo(0, 22);
        ctx.lineTo(12, 28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 5. Teeth
        ctx.lineWidth = 1.8;
        const teethWidth = 8;
        for (let i = -4; i <= 4; i++) {
          ctx.strokeRect(i * teethWidth - teethWidth / 2, 60, teethWidth, 18);
        }

        // 6. Cross-hatching Texture
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(226, 222, 212, 0.4)';
        for (let h = -55; h <= 55; h += 6) {
          ctx.beginPath();
          ctx.moveTo(h, -90);
          ctx.lineTo(h + 10, -65);
          ctx.stroke();
        }

        // 7. Eye Glow Pulse in Phase 2 & 3
        if (phase >= 2) {
          const glowAlpha = (Math.sin(frame * 3) + 1) * 0.45;
          ctx.fillStyle = phase === 3 ? `rgba(239, 68, 68, ${glowAlpha})` : `rgba(0, 229, 255, ${glowAlpha})`;
          ctx.beginPath();
          ctx.arc(-32, -15, 8, 0, Math.PI * 2);
          ctx.arc(32, -15, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Floating Stipple Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -width / 2 || p.x > width / 2) p.vx *= -1;
        if (p.y < -height / 2 || p.y > height / 2) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, p.size, 0, Math.PI * 2);

        if (phase === 3 && p.isScam) {
          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#e2ded4';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      // Laser Scanner Wave in Phase 2
      if (phase === 2) {
        scanY += 6;
        if (scanY > height) scanY = 0;

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase]);

  return (
    <div
      style={{ opacity, transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col justify-between items-center overflow-hidden py-12 px-6"
    >
      
      {/* HTML5 Canvas Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* TOP HEADER BADGE (Phase 1-3) */}
      {phase < 4 ? (
        <div className="relative z-10 text-center max-w-2xl pointer-events-none transition-all duration-700">
          <p className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest bg-[#161514] border border-[#333330] px-4 py-1.5 rounded-full inline-block shadow-lg">
            HIREGUARD® CYBER INTELLIGENCE
          </p>
        </div>
      ) : (
        <div className="hidden" />
      )}

      {/* CENTER BRAND REVEAL (Phase 4 - Centered Dead in Middle) */}
      {phase === 4 ? (
        <div className="relative z-20 flex flex-col items-center justify-center my-auto text-center space-y-6 animate-pulse pointer-events-none">
          <div className="w-20 h-20 bg-[#ffffff] text-[#000000] rounded-2xl p-4 shadow-2xl flex items-center justify-center">
            <Shield className="h-12 w-12 text-[#000000]" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-7xl font-heading font-black text-[#f3f0e8] tracking-wider uppercase">
              HIREGUARD® <span className="text-[#00E5FF]">AI</span>
            </h1>
            <p className="text-sm font-mono text-[#00E5FF] mt-2 tracking-widest uppercase">
              TRUST BEFORE YOU APPLY — SYSTEM ONLINE
            </p>
          </div>
        </div>
      ) : (
        /* BOTTOM CAPTION STRIP (Phase 1-3) */
        <div className="relative z-10 text-center max-w-2xl pointer-events-none transition-all duration-700 mb-8">
          <h1 className="text-lg sm:text-2xl font-heading font-bold text-[#f3f0e8] tracking-tight leading-relaxed bg-[#000000]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#333330] shadow-2xl">
            "{copyText[phase]}"
          </h1>
        </div>
      )}

      {/* Skip Button */}
      <button
        onClick={() => {
          setOpacity(0);
          setTimeout(() => { if (onComplete) onComplete(); }, 600);
        }}
        className="absolute bottom-8 right-8 z-30 px-5 py-2.5 bg-[#161514] border border-[#333330] hover:bg-[#ffffff] hover:text-[#000000] text-[#f3f0e8] text-xs font-mono tracking-wider rounded-full transition-all cursor-pointer pointer-events-auto shadow-lg"
      >
        SKIP INTRO ↗
      </button>

    </div>
  );
};

export default CinematicIntro;
