"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import NavbarButton from "./NavbarButton";
const navLinks = [
  { name: "Platform", href: "#features" },
  { name: "Technology", href: "#how-it-works" },
  { name: "Metrics", href: "#metrics" },
  { name: "Developers", href: "#developers" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl min-w-100 mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
  <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-[#008e72]" />
    <span className="font-bold text-lg relative z-10 text-white [font-family:var(--font-fredericka)]">
      T
    </span>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10" />
  </div>
  <span className="text-2xl spacing-2 text-primary font-bold tracking-[5px] [font-family:var(--font-londrina)]">
    TechNify
  </span>
</a>

          {/* Desktop Navigation */}

          {/* Desktop CTA */}
          <div className="flex items-center gap-3">
            <NavbarButton/>
          </div>

          {/* Mobile Menu Button */}
        </div>

        {/* Mobile Menu */}
      </nav>
    </header>
  );
}
