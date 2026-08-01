import React, { useEffect, useRef } from 'react';

/**
 * WoodcutSkullCanvas Component
 * Renders an interactive 60 FPS hand-drawn woodcut engraved skull artwork on a pitch-black background (#000000),
 * matching the exact dark-art stipple aesthetic requested by the user.
 */
const WoodcutSkullCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 600);
    let height = (canvas.height = 380);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth || 600;
      height = canvas.height = 380;
    };
    window.addEventListener('resize', handleResize);

    // Stipple particles
    const particleCount = 40;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: (Math.random() - 0.5) * 0.4
      });
    }

    let frame = 0;

    const render = () => {
      // Pitch Black Background matching image
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      frame += 0.02;
      const centerX = width / 2;
      const centerY = height / 2 + Math.sin(frame) * 6; // Floating motion

      ctx.save();
      ctx.translate(centerX, centerY);
      // Subtle tilt rotation
      ctx.rotate(Math.sin(frame * 0.5) * 0.04);

      // --- WOODCUT ENGRAVED SKULL DRAWING ---
      ctx.strokeStyle = '#e2ded4';
      ctx.fillStyle = '#e2ded4';
      ctx.lineWidth = 1.8;

      // 1. Skull Cranium Outer Outline
      ctx.beginPath();
      ctx.ellipse(0, -20, 65, 75, 0, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.stroke();

      // 2. Cheekbones & Zygomatic Arches
      ctx.beginPath();
      ctx.moveTo(-60, -10);
      ctx.quadraticCurveTo(-72, 10, -52, 25);
      ctx.lineTo(-38, 25);
      ctx.lineTo(-38, 45); // Upper Jaw
      ctx.lineTo(38, 45);
      ctx.lineTo(38, 25);
      ctx.lineTo(52, 25);
      ctx.quadraticCurveTo(72, 10, 60, -10);
      ctx.stroke();

      // 3. Eye Sockets (Dark Cavities with Stipple shading)
      // Left Eye
      ctx.beginPath();
      ctx.ellipse(-26, -10, 16, 20, Math.PI * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(26, -10, 16, 20, -Math.PI * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();

      // Eye Socket Threat Glow Pulse (Red/Cyan threat detection)
      const glowAlpha = (Math.sin(frame * 2) + 1) * 0.35;
      ctx.fillStyle = `rgba(0, 229, 255, ${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(-26, -10, 5, 0, Math.PI * 2);
      ctx.arc(26, -10, 5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Nasal Cavity (Inverted Heart shape)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-9, 22);
      ctx.lineTo(0, 18);
      ctx.lineTo(9, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Woodcut Teeth Grid
      ctx.strokeStyle = '#e2ded4';
      ctx.lineWidth = 1.5;
      const teethWidth = 6;
      for (let i = -4; i <= 4; i++) {
        ctx.strokeRect(i * teethWidth - teethWidth / 2, 45, teethWidth, 14);
      }

      // 6. Engraved Woodcut Cross-Hatching Lines (Textural Shading)
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(226, 222, 212, 0.4)';

      // Forehead hatching
      for (let h = -45; h <= 45; h += 5) {
        ctx.beginPath();
        ctx.moveTo(h, -70);
        ctx.lineTo(h + 8, -50);
        ctx.stroke();
      }

      // Temple hatching
      for (let h = -60; h <= -40; h += 4) {
        ctx.beginPath();
        ctx.moveTo(h, -30);
        ctx.lineTo(h + 6, -15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-h, -30);
        ctx.lineTo(-h - 6, -15);
        ctx.stroke();
      }

      // Floating Stipple Particles around Skull
      ctx.fillStyle = 'rgba(226, 222, 212, 0.6)';
      particles.forEach(p => {
        p.y += p.speed;
        if (p.y > 150) p.y = -150;
        if (p.y < -150) p.y = 150;

        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full relative my-8 overflow-hidden flex flex-col items-center justify-center bg-[#000000] py-6 rounded-2xl border border-[#333330] shadow-2xl">
      <canvas ref={canvasRef} className="max-w-full h-[380px] block" />
      <span className="text-[10px] font-mono tracking-widest text-[#8c867a] uppercase mt-2">
        SCAM THREAT MONITOR — ENGRAVED WOODCUT INTELLIGENCE ARTWORK
      </span>
    </div>
  );
};

export default WoodcutSkullCanvas;
