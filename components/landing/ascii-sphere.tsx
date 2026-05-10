"use client";

import { useEffect, useRef } from "react";

export function AsciiSphere({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = ".:-=+*#%@";

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textBaseline = "top";

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      const charWidth = 7;
      const charHeight = 12;

      const t = timeRef.current;
      const cosT = Math.cos(t * 0.5);
      const sinT = Math.sin(t * 0.5);

      const lightX = 0.5;
      const lightY = -0.5;
      const lightZ = 0.7;
      const lightMag = Math.hypot(lightX, lightY, lightZ);

      for (let y = -radius; y < radius; y += charHeight) {
        for (let x = -radius; x < radius; x += charWidth) {
          const distSq = x * x + y * y;
          if (distSq >= radius * radius) continue;

          const z = Math.sqrt(radius * radius - distSq);

          const rotatedX = x * cosT - z * sinT;
          const rotatedZ = x * sinT + z * cosT;

          const nx = rotatedX / radius;
          const ny = y / radius;
          const nz = rotatedZ / radius;

          const dot = (nx * lightX + ny * lightY + nz * lightZ) / lightMag;
          const brightness = Math.max(0, dot);

          const charIndex = Math.min(
            chars.length - 1,
            Math.floor(brightness * (chars.length - 1))
          );

          ctx.fillStyle = `hsl(0, 0%, ${10 + brightness * 60}%)`;
          ctx.fillText(chars[charIndex], centerX + x, centerY + y);
        }
      }
    };

    const loop = () => {
      if (visibleRef.current) {
        draw();
        timeRef.current += 0.015;
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={className || "w-full h-full"} style={{ minHeight: "300px" }} />;
}