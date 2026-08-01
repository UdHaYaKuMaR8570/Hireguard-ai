import React, { useEffect, useRef } from 'react';

/**
 * DitherHandsCanvas Component
 * Generates the dithered halftone canvas visual of the AI Cybernetic Hand reaching the Human Hand
 * matching the NEXORA® hero artwork in the uploaded design template.
 */
const DitherHandsCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 900);
    let height = (canvas.height = 320);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth || 900;
      height = canvas.height = 320;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame += 0.02;

      const leftX = width * 0.25;
      const rightX = width * 0.75;
      const centerY = height / 2;
      const pulse = Math.sin(frame) * 4;

      // Draw Left Cybernetic Robot Hand Skeleton Points (Dithered Stipple style)
      ctx.fillStyle = '#0d0d0d';
      ctx.strokeStyle = '#0d0d0d';
      ctx.lineWidth = 1.5;

      // Robot Arm segments
      for (let i = 0; i < 40; i++) {
        const x = (width * 0.05) + (i * (leftX - width * 0.05) / 40);
        const y = centerY + Math.sin(i * 0.2) * 12;
        // Dither dot cluster
        for (let d = 0; d < 3; d++) {
          const rx = x + (Math.random() - 0.5) * 18;
          const ry = y + (Math.random() - 0.5) * 18;
          ctx.fillRect(rx, ry, 1.5, 1.5);
        }
      }

      // Robot Finger pointing right
      ctx.beginPath();
      ctx.moveTo(leftX, centerY);
      ctx.lineTo(leftX + 110 + pulse, centerY - 5);
      ctx.stroke();

      // Finger Joint Nodes
      ctx.beginPath();
      ctx.arc(leftX + 110 + pulse, centerY - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Right Human Hand Outline (Dithered Stipple style)
      for (let i = 0; i < 40; i++) {
        const x = width * 0.95 - (i * (width * 0.95 - rightX) / 40);
        const y = centerY + Math.cos(i * 0.2) * 12;
        for (let d = 0; d < 3; d++) {
          const rx = x + (Math.random() - 0.5) * 18;
          const ry = y + (Math.random() - 0.5) * 18;
          ctx.fillRect(rx, ry, 1.5, 1.5);
        }
      }

      // Human Finger pointing left
      ctx.beginPath();
      ctx.moveTo(rightX, centerY);
      ctx.lineTo(rightX - 110 - pulse, centerY - 5);
      ctx.stroke();

      // Finger Joint Nodes
      ctx.beginPath();
      ctx.arc(rightX - 110 - pulse, centerY - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // The Spark of Connection (Center Pulse)
      const sparkX = width / 2;
      const sparkY = centerY - 5;
      const sparkRadius = 6 + Math.abs(Math.sin(frame * 2)) * 6;

      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0d0d0d';
      ctx.fill();

      // Radial dither dots around spark connection
      for (let k = 0; k < 16; k++) {
        const angle = (k / 16) * Math.PI * 2;
        const dist = 14 + Math.sin(frame * 3 + k) * 4;
        const sx = sparkX + Math.cos(angle) * dist;
        const sy = sparkY + Math.sin(angle) * dist;
        ctx.fillRect(sx, sy, 2, 2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full relative my-8 overflow-hidden flex justify-center">
      <canvas ref={canvasRef} className="max-w-full h-[320px] block" />
    </div>
  );
};

export default DitherHandsCanvas;
