"use client";

import React, { useEffect, useRef } from "react";

export default function NavbarButton() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!boxRef.current) return;

      for (let i = 0; i < 3; i++) {
        const particle = document.createElement("div");

        particle.className = "absolute w-4 h-4 rounded-full pointer-events-none animate-bleeding";
        // Spreading color: oklch(0.55 0.2 170)
        particle.style.background = "oklch(0.55 0.2 170)";

        const angle = Math.random() * 2 * Math.PI;
        const distance = 40 + Math.random() * 30;
        const dx = Math.cos(angle) * distance + "px";
        const dy = Math.sin(angle) * distance + "px";

        particle.style.setProperty("--dx", dx);
        particle.style.setProperty("--dy", dy);
        particle.style.left = "50%";
        particle.style.top = "50%";

        boxRef.current.appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <a href="#" className="group relative flex items-center justify-center">
        {/* Gooey Box — white bg, turns oklch on hover */}
        <div
          ref={boxRef}
          style={{
            filter: "url(#gooey)",
            background: "oklch(0.55 0.2 170)",
            transition: "background 0.5s",
          }}
          className="relative w-[140px] h-9 rounded-[8px]"
        />

        {/* Label — black text, white on hover */}
        <span
          style={{ color: "black", background: "white" }}
          className="absolute text-xs tracking-[0.2em] px-4 h-9 flex items-center rounded-[8px] transition-all duration-500 pointer-events-none group-hover:tracking-[0.3em] group-hover:bg-[oklch(0.55_0.2_170)]! group-hover:text-white!"
        >
          Talk with Us
        </span>
      </a>

      {/* SVG Gooey Filter */}
      <svg className="hidden">
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 50 -10"
          />
        </filter>
      </svg>
    </>
  );
}