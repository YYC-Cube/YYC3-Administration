import { memo, useCallback, useEffect, useRef } from "react";

import { useApp } from "./app-context";

// ==========================================
// YYC³ 粒子背景系统 — Phase 5
// Canvas-based lightweight particle network
// 漂浮数据节点 + 霓虹连线 + RAF 性能优化
// ==========================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const NEON_COLORS = [
  "#00f0ff", // primary cyan
  "#00d4ff", // secondary blue-cyan
  "#00ffcc", // accent cyan-green
  "#00ffc8", // success cyan
  "#41ffdd", // highlight cyan
];

const CONNECTION_DISTANCE = 120;
const PARTICLE_COUNT_FACTOR = 0.000035; // particles per pixel²
const MAX_PARTICLES = 60;
const MIN_PARTICLES = 15;

/**
 * Canvas-based particle network background.
 * Renders floating data-node particles with neon connecting lines using
 * `requestAnimationFrame` for smooth 60 fps animation. Respects the global
 * `theme.dataFlowEnabled` toggle and scales particle count by viewport area.
 * Memoized with `React.memo` to prevent unnecessary re-renders.
 */
export const ParticleCanvas = memo(function ParticleCanvas() {
  const { theme } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const createParticles = useCallback((width: number, height: number): Particle[] => {
    const area = width * height;
    const count = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.floor(area * PARTICLE_COUNT_FACTOR)));
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 2,
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      alpha: 0.15 + Math.random() * 0.35,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !theme.dataFlowEnabled) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Track mouse for interaction
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const neonScale = theme.neonIntensity / 100;

    // Animation loop
    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulse
        p.pulsePhase += p.pulseSpeed;
        const pulse = 0.6 + 0.4 * Math.sin(p.pulsePhase);

        // Mouse attraction (gentle)
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 150 && mDist > 1) {
          p.vx += (mdx / mDist) * 0.02;
          p.vy += (mdy / mDist) * 0.02;
        }

        // Velocity dampening
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw node
        const alpha = p.alpha * pulse * neonScale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.15 * neonScale;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse connection lines
      if (mouse.x > 0 && mouse.y > 0) {
        for (const p of particles) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const lineAlpha = (1 - dist / 180) * 0.25 * neonScale;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [theme.dataFlowEnabled, theme.neonIntensity, createParticles]);

  if (!theme.dataFlowEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas absolute inset-0 pointer-events-auto z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
});