'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Palette, Hammer, FlaskConical, Rocket } from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const steps = [
  { label: 'PLAN', icon: Target },
  { label: 'DESIGN', icon: Palette },
  { label: 'BUILD', icon: Hammer },
  { label: 'TEST', icon: FlaskConical },
  { label: 'SHIP', icon: Rocket },
];

const ProcessTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // gsap.context is the best practice for React to handle cleanup easily
    const ctx = gsap.context(() => {
      // 1. Initial State: Hide all elements
      gsap.set('.step-node', { opacity: 0, scale: 0.8, x: -10 });
      gsap.set('.step-line', { scaleY: 0, transformOrigin: 'top center' });

      // 2. Create the Timeline linked to ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Starts animation when the top of the container hits 80% down the viewport
        },
        defaults: { ease: 'power3.out' },
      });

      // 3. Sequentially animate elements
      steps.forEach((_, index) => {
        // Animate the node (Icon and Text together)
        tl.to(`.step-node-${index}`, {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.5,
        });

        // Animate the connecting straight line
        if (index < steps.length - 1) {
          tl.to(
            `.step-line-${index}`,
            {
              scaleY: 1,
              duration: 0.4,
              ease: 'power2.inOut',
            },
            '-=0.2' // Start slightly before the node animation finishes
          );
        }
      });
    }, containerRef);

    // Cleanup timeline on unmount
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen items-center justify-start bg-transparent p-10 font-sans"
    >
      <div className="flex flex-col items-start w-full max-w-md mx-auto">
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex items-start gap-5">
            
            {/* Left Column: Icon and Vertical Line */}
            <div className="flex flex-col items-center">
              {/* Icon Node */}
              <div
                className={`step-node step-node-${index} flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700`}
              >
                <step.icon className="h-5 w-5 text-green-400" strokeWidth={2} />
              </div>

              {/* Connector Line (Straight, no dots) */}
              {index < steps.length - 1 && (
                <div className="relative h-12 w-[2px] my-1">
                  {/* Background (static) line */}
                  <div className="absolute inset-0 h-full w-full bg-neutral-800" />
                  {/* Animated (green) line */}
                  <div
                    className={`step-line step-line-${index} absolute inset-0 h-full w-full bg-green-500`}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Text Content */}
            <div className={`step-node step-node-${index} flex flex-col pt-1`}>
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                {step.label}
              </span>
              <span className="text-2xl font-bold tracking-tight text-green-400 capitalize">
                {step.label.toLowerCase()}
              </span>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTimeline;