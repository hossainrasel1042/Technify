"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { AsciiCube } from "./ascii-cube";

type FormState = {
  name: string;
  email: string;
  phone: string;
  business: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type SubmitStatus = "idle" | "loading" | "success";

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-().]{7,15}$/.test(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.business.trim()) {
    errors.business = "Please tell us about your business.";
  }

  return errors;
}

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    business: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first errored field
      const firstKey = Object.keys(validationErrors)[0] as keyof FormState;
      document.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setSubmitStatus("loading");

    try {
      // TODO: replace with real endpoint
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitStatus("success");
    } catch {
      // Keep loading false even on error so user can retry
      setSubmitStatus("idle");
    }
  };

  // "Get Planning now" → focus name field
  const focusNameField = () => {
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const inputBase =
    "w-full bg-background/10 border border-background/20 rounded-lg px-3 py-2 text-sm text-background placeholder:text-background/40 outline-none focus:border-background/60 focus:ring-1 focus:ring-background/30 transition-all";

  const errorClass = "border-red-400/60 focus:border-red-400 focus:ring-red-400/20";

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-foreground" />
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 px-8 lg:px-16 py-16 bg-transparent">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-10">

              {/* ── Left: Copy + CTA ── */}
              <div className="max-w-md">
                <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6 text-background text-balance">
                  Start building the future, today.
                </h2>

                <p className="text-lg text-background/70 mb-8 leading-relaxed">
                  Join thousands of teams shipping faster with Technify.
                  Free to start, scales with you.
                </p>

                <Button
                  size="lg"
                  onClick={focusNameField}
                  className="bg-background hover:bg-background/90 text-foreground px-6 h-12 text-sm font-medium group"
                >
                  Get Planning now
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>

              {/* ── Right: Contact Form ── */}
              <div className="max-w-md">
                <div className="flex flex-col gap-3">

                  {/* Name */}
                  <div>
                    <input
                      ref={nameRef}
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={submitStatus === "success"}
                      className={`${inputBase} ${errors.name ? errorClass : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      disabled={submitStatus === "success"}
                      className={`${inputBase} ${errors.email ? errorClass : ""}`}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={submitStatus === "success"}
                      className={`${inputBase} ${errors.phone ? errorClass : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* About business */}
                  <div>
                    <textarea
                      name="business"
                      placeholder="Tell us about your business"
                      rows={3}
                      value={form.business}
                      onChange={handleChange}
                      disabled={submitStatus === "success"}
                      className={`${inputBase} resize-none ${errors.business ? errorClass : ""}`}
                    />
                    {errors.business && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{errors.business}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitStatus === "loading" || submitStatus === "success"}
                    className="w-full h-11 text-sm font-medium bg-background text-foreground hover:bg-background/90 disabled:opacity-100 disabled:cursor-not-allowed transition-all"
                  >
                    {submitStatus === "loading" && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {submitStatus === "idle" && "Let's go"}
                    {submitStatus === "loading" && "Sending…"}
                    {submitStatus === "success" && "We will touch you 👋"}
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}