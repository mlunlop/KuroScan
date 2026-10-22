import React, { useEffect, useRef } from 'react';

/**
 * GlowWaveBackground
 * Monochromatic Apple-style liquid glow wave background.
 * Uses high-performance 2D Canvas rendering with organic sine-wave propagation
 * and subtle radial glow gradients in monochromatic shades.
 */
export const GlowWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let step = 0;

    const render = () => {
      step += 0.008;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Radial Ambient Glow 1 (Upper Center - Soft Silver Glow)
      const grad1 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(step * 0.7) * (width * 0.15),
        height * 0.25 + Math.cos(step * 0.5) * (height * 0.08),
        10,
        width * 0.5,
        height * 0.25,
        width * 0.65
      );
      grad1.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
      grad1.addColorStop(0.5, 'rgba(200, 200, 220, 0.025)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Radial Ambient Glow 2 (Lower Wave Center - Deep Silver Sheen)
      const grad2 = ctx.createRadialGradient(
        width * 0.65 + Math.cos(step * 0.6) * (width * 0.2),
        height * 0.75 + Math.sin(step * 0.8) * (height * 0.1),
        20,
        width * 0.65,
        height * 0.75,
        width * 0.7
      );
      grad2.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      grad2.addColorStop(0.6, 'rgba(180, 180, 190, 0.015)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Draw Animated Fluid Waves
      const drawWave = (
        baseY: number,
        amplitude: number,
        frequency: number,
        speed: number,
        alpha: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 12) {
          const y =
            baseY +
            Math.sin(x * frequency + step * speed) * amplitude +
            Math.cos(x * frequency * 0.5 + step * speed * 0.7) * (amplitude * 0.6);
          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
        waveGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        waveGrad.addColorStop(0.3, `rgba(220, 220, 230, ${alpha * 0.4})`);
        waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = waveGrad;
        ctx.fill();
      };

      // Layer 1: High subtle wave
      drawWave(height * 0.45, 55, 0.003, 1.2, 0.04);
      // Layer 2: Middle contrasting wave
      drawWave(height * 0.62, 70, 0.0025, 0.9, 0.035);
      // Layer 3: Bottom ambient glow wave
      drawWave(height * 0.82, 85, 0.002, 0.6, 0.05);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
};
