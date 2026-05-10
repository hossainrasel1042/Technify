"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AsciiWave } from "./ascii-wave";

// Register the plugin
gsap.registerPlugin(useGSAP);

// Helper component to split text
const SplitChars = ({ text }: { text: string }) => {
  return (
    <>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="hero-char inline-block"
          style={{ visibility: "hidden", opacity: 0 }} 
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
};

export function HeroSection() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 0. FOUC KILLER: Instantly make the parent wrapper visible exactly as GSAP initializes
    gsap.set(".gsap-reveal-wrapper", { autoAlpha: 1 });

    // Initial setup for TechNify
    gsap.set(".hero-technify", { 
      autoAlpha: 0, 
      y: -100, 
      rotation: 180, 
      scale: 1 
    });

    // 1. Characters fall from above one by one
    tl.fromTo(
      ".hero-char",
      { y: -100, autoAlpha: 0 }, 
      { 
        y: 0, 
        autoAlpha: 1, 
        duration: 0.4, 
        stagger: 0.03 
      }
    )
    
    // 2. TechNify falls down (rotated 180deg)
    .to(".hero-technify", {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
    }, "-=0.2")
    
    // 3. Flip to correct position
    .to(".hero-technify", {
      rotation: 0,
      duration: 0.6,
      ease: "back.out(1.5)",
    }, "+=0.1")

    // 4. SHAKE ANIMATION
    .to(".hero-technify", {
      keyframes: [
        { x: -6, y: 2, rotation: -4, duration: 0.06 },
        { x: 6, y: -2, rotation: 4, duration: 0.06 },
        { x: -6, y: 2, rotation: -4, duration: 0.06 },
        { x: 6, y: -2, rotation: 4, duration: 0.06 },
        { x: 0, y: 0, rotation: 0, duration: 0.06 } // Reset to center
      ],
      ease: "none",
    }, "+=0.1")

    // 5. Change font right in the MIDDLE of the shake
    .set(".hero-technify", {
      fontFamily: "var(--font-fredericka)",
    }, "-=0.15")
    
    // 6. Scale up after it finishes shaking
    .to(".hero-technify", {
      scale: 1.35,
      duration: 0.3,
      rotation: -3,
      marginLeft:4,
      ease: "back.out(2)", 
    })

    // 7. Subtext: Falls from above
    .fromTo(".hero-text", 
      { y: -50, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4 }, 
      "-=0.4"
    )
    
    // 8. CTA Buttons: Staggered fall
    .fromTo(".hero-btn", 
      { y: -50, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 
      "-=0.3"
    )
    
    // 9. Stat Cards: Staggered fall from above
    .fromTo(".hero-stat", 
      { y: -100, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.2)" }, 
      "-=0.4"
    )
    
    // 10. Stat Numbers: Increment animation for 3+ and 2+
    .add(() => {
      gsap.utils.toArray(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.target);
        if (!isNaN(target)) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              el.innerText = Math.floor(obj.val);
            }
          });
        }
      });
    }, "-=0.3");

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex flex-col min-w-100 justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <AsciiWave className="w-full h-full" />
      </div>
      
      {/* 
        THE FIX: We wrap the entire content in a div with inline opacity: 0.
        This completely hides the HTML during React hydration. 
        As soon as JS runs, GSAP removes the opacity: 0.
      */}
      <div 
        className="gsap-reveal-wrapper relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        
        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto mb-10">
          <h1 
            className="text-[25px] text-400:text-3xl xs-2:text-4xl  md-custom:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-8"
            style={{ fontFamily: 'var(--font-geist-pixel-line), monospace' }}
          >
            <span className="text-balance block mb-2">
              <SplitChars text="The complete solution for your" />
            </span>
            <span className="text-balance inline-flex items-center flex-wrap justify-center gap-x-[0.2em]">
              <span>
                <SplitChars text="Business is now " />
              </span>
              <span 
                className="hero-technify text-primary inline-block transform-gpu origin-center"
                style={{ visibility: "hidden", opacity: 0 }}
              >
                TechNify
              </span>
            </span>
          </h1>
          
          <p className="hero-text text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" style={{ visibility: "hidden", opacity: 0 }}>
            Your toolkit to stop configuring and start innovating. 
            Securely build, deploy, and scale AI-powered applications.
          </p>
        </div>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
          <div className="hero-btn" style={{ visibility: "hidden", opacity: 0 }}>
            <Button 
              size="lg" 
              className="bg-foreground hover:bg-foreground/90 text-background px-6 h-11 text-sm font-medium group"
            >
              Get a demo
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
          <div className="hero-btn flex flex-col xs-2:flex-row gap-3" style={{ visibility: "hidden", opacity: 0 }}>
  {/* WhatsApp Button */}
  <Button
    size="lg"
    className="h-11 px-6 text-sm font-medium text-white border-0"
    style={{ backgroundColor: "#25D366" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 mr-2 shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.528 5.845L.057 23.571a.75.75 0 0 0 .92.921l5.752-1.506A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0a12 12 0 0 0-.056 0zm0 21.75a9.718 9.718 0 0 1-4.953-1.355l-.355-.212-3.416.895.91-3.329-.232-.368A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
    Reach out via WhatsApp
  </Button>

  {/* Telegram Button */}
  <Button
    size="lg"
    className="h-11 px-6 text-sm font-medium text-white border-0"
    style={{ backgroundColor: "#229ED9" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 mr-2 shrink-0"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
    Drop a Line on Telegram
  </Button>
</div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden card-shadow">
  {[
    { value: "3", label: "dedicated experts on the team.", company: "CORE TEAM", animate: true },
    { value: "2", label: "full-scale projects delivered.", company: "PORTFOLIO", animate: true },
    { value: "100%", label: "client focus and dedication.", company: "RELIABILITY", animate: false },
    { value: "24/7", label: "direct communication loop.", company: "SUPPORT", animate: false },
  ].map((stat) => (
    <div 
      key={stat.company} 
      className="hero-stat p-6 lg:p-8 flex justify-between min-h-[140px] bg-black shadow-none lg:py-8 flex-col"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <div>
        <span className="text-xl lg:text-2xl font-semibold">
          {stat.animate ? (
            <>
              <span 
                className="stat-number inline-block" 
                data-target={stat.value}
              >
                0
              </span>
              <span className="stat-plus">+</span>
            </>
          ) : (
            stat.value
          )}
        </span>
        <span className="text-muted-foreground text-sm lg:text-base"> {stat.label}</span>
      </div>
      <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mt-4">
        {stat.company}
      </div>
    </div>
  ))}
</div>
      </div>
    </section>
  );
}