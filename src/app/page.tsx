"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { FEATURED_STUDIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const handleFeaturedClick = (study: any) => {
    router.push("/new"); // Normally pass state or use query params in real app
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col selection:bg-amber-600/30 font-sans">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0a]/60 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover animate-ken-burns opacity-30 grayscale-[0.5]"
          alt=""
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
      </div>

      <nav className="p-8 flex justify-between items-center bg-black/20 backdrop-blur-lg sticky top-0 z-[60] px-10 max-w-[100vw] border-b border-white/5">
        <button
          onClick={() => router.push("/")}
          className="hover:scale-105 transition-transform active:scale-95 origin-left"
        >
          <Logo />
        </button>
        <div className="flex space-x-6 items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-neutral-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            Library
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="h-10 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-amber-600/40 text-amber-500 hover:bg-amber-600/10 hover:text-amber-400"
          >
            Login
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-20">
          <div className="animate-fade-in max-w-5xl">
            <div className="inline-flex items-center space-x-3 mb-12 px-5 py-2 rounded-full border border-amber-600/20 bg-amber-600/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></span>
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-amber-500">
                AI-Powered Inductive Learning
              </span>
            </div>
            <h1 className="serif-text text-7xl md:text-[10rem] font-light mb-12 leading-[0.85] tracking-tighter text-white drop-shadow-2xl">
              Behold the <span className="italic text-neutral-400">Word</span>{" "}
              in{" "}
              <span className="text-amber-500 font-medium">Full Detail.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
              Experience the Bible through a structured, 14-point inductive
              framework. Transform simple themes into cinematic, deep-dive
              explorations in seconds.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
              <Button
                size="lg"
                className="px-16 h-20 rounded-full text-lg font-bold shadow-2xl shadow-amber-600/20 hover:scale-105 transition-all bg-amber-600 hover:bg-amber-500"
                onClick={() => router.push("/new")}
              >
                Create Your Study
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="px-12 h-20 rounded-full text-lg font-medium border-neutral-800 bg-neutral-900/50 backdrop-blur-md hover:bg-neutral-800 text-neutral-300"
                onClick={() => {
                  document
                    .getElementById("featured")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse Themes
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST & BENEFITS GRID */}
        <section
          ref={addToRefs}
          className="reveal-on-scroll py-32 w-full max-w-7xl px-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              type="Beginners"
              title="Accessible Wisdom"
              desc="No seminary degree required. We simplify complex theological concepts into clear, actionable observation."
              icon="🌱"
            />
            <BenefitCard
              type="Believers"
              title="Daily Depth"
              desc="Move beyond surface-level reading. Discover new angles and cross-references that deepen your walk."
              icon="🕊️"
            />
            <BenefitCard
              type="Pastors"
              title="Research Accelerant"
              desc="Instantly pull historical, cultural, and archeological contexts to supplement your sermon preparation."
              icon="🏛️"
            />
            <BenefitCard
              type="Scholars"
              title="Inductive Rigor"
              desc="A structured 14-section framework that adheres to high-fidelity hermeneutical principles."
              icon="📜"
            />
          </div>
        </section>

        {/* FEATURED STUDIES GALLERY */}
        <section
          id="featured"
          ref={addToRefs}
          className="reveal-on-scroll py-32 w-full max-w-[90rem] px-6"
        >
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex px-3 py-1 rounded-full bg-amber-600/10 text-amber-500 text-[10px] uppercase font-black tracking-[0.4em] border border-amber-600/20">
              Library Showcase
            </div>
            <h2 className="serif-text text-6xl md:text-7xl text-white font-light tracking-tighter">
              Inspirational{" "}
              <span className="italic text-neutral-500">Portals</span>
            </h2>
            <p className="text-neutral-500 text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Choose a pre-designed historical gate and begin your descent into
              the depth of revelation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_STUDIES.map((study, idx) => (
              <PortalCard
                key={idx}
                category={(study as any).category || "Scripture"}
                title={study.title}
                passages={study.passages}
                bg={
                  study.image ||
                  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800"
                }
                onClick={() => handleFeaturedClick(study)}
              />
            ))}
          </div>
        </section>

        {/* INDUCTIVE METHOD BREAKDOWN */}
        <section
          ref={addToRefs}
          className="reveal-on-scroll py-32 w-full bg-[#0d0d0d]/50 border-y border-neutral-900 px-6"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="serif-text text-5xl md:text-6xl font-light text-white leading-tight">
                  The <span className="italic text-amber-500">Method</span> of
                  Revelation.
                </h2>
                <p className="text-neutral-400 text-lg leading-relaxed">
                  Most readers rush to application. ScripturePath forces a
                  slower, more fruitful path through the Inductive Trinity:
                </p>
              </div>
              <div className="space-y-10">
                <MethodStep
                  number="01"
                  title="Observation"
                  text="What does the text actually say? We identify themes, keywords, and structural nuances."
                />
                <MethodStep
                  number="02"
                  title="Interpretation"
                  text="What does the text mean? We integrate historical context, cross-references, and archaeology."
                />
                <MethodStep
                  number="03"
                  title="Application"
                  text="How do I respond? We draft specific, life-altering plans based on the theological truths discovered."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square glass rounded-[60px] p-12 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-600/5 animate-pulse"></div>
                <div className="text-center space-y-4">
                  <div className="serif-text text-8xl text-amber-500/20">
                    14
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-500">
                    Sections of Exploration
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL COMPONENT */}
        <section
          ref={addToRefs}
          className="reveal-on-scroll py-32 px-6 text-center max-w-4xl"
        >
          <h2 className="serif-text text-5xl md:text-6xl font-light mb-10">
            Study Alone. <span className="italic">Grow Together.</span>
          </h2>
          <p className="text-neutral-400 text-xl leading-relaxed mb-16">
            Generate a link to share your active study with friends or small
            groups. Each section is designed to facilitate both silent
            meditation and deep communal discussion.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-8 glass rounded-3xl text-left">
              <div className="text-amber-500 mb-4 text-2xl">👤</div>
              <h4 className="text-white font-bold mb-2">Personal Quiet Time</h4>
              <p className="text-neutral-500 text-sm">
                Dark mode designed for late-night or early-morning focused
                reading.
              </p>
            </div>
            <div className="p-8 glass rounded-3xl text-left">
              <div className="text-amber-500 mb-4 text-2xl">👥</div>
              <h4 className="text-white font-bold mb-2">Community Groups</h4>
              <p className="text-neutral-500 text-sm">
                Present the study on a screen or send it as a digital journal
                for your group.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          ref={addToRefs}
          className="reveal-on-scroll py-48 w-full px-6 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="serif-text text-6xl md:text-8xl font-light text-white leading-[1.1]">
              Ready to <span className="italic text-amber-500">encounter</span>{" "}
              the text?
            </h2>
            <div className="pt-8">
              <Button
                size="lg"
                className="px-20 h-24 rounded-full text-2xl font-bold shadow-3xl shadow-amber-900/40 hover:scale-110 transition-transform bg-amber-600 hover:bg-amber-500"
                onClick={() => router.push("/new")}
              >
                Generate Study Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 p-24 border-t border-neutral-900 text-center bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto flex flex-col items-center space-y-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>
          <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.4em] leading-loose max-w-md">
            Built for those who hunger. For the scholars, for the seekers, for
            the church.
          </p>
          <div className="pt-4 flex space-x-12 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.5em]">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Theology
            </a>
            <a href="#" className="hover:text-white transition-colors">
              API
            </a>
          </div>
          <p className="text-neutral-700 text-[9px] uppercase tracking-widest pt-12">
            © {new Date().getFullYear()} ScripturePath Laboratory. Non nobis
            Domine.
          </p>
        </div>
      </footer>
    </div>
  );
}

const BenefitCard = ({
  type,
  title,
  desc,
  icon,
}: {
  type: string;
  title: string;
  desc: string;
  icon: string;
}) => (
  <div className="p-10 glass rounded-[40px] text-left border border-white/5 hover:border-amber-600/30 transition-all hover:-translate-y-2 duration-500 group">
    <div className="text-2xl mb-8 group-hover:scale-125 transition-transform origin-left">
      {icon}
    </div>
    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 mb-2">
      {type}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">
      {title}
    </h3>
    <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const MethodStep = ({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) => (
  <div className="flex space-x-8 group">
    <div className="text-amber-500/20 serif-text text-5xl font-light italic transition-colors group-hover:text-amber-500/40">
      {number}
    </div>
    <div className="space-y-2">
      <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
        {text}
      </p>
    </div>
  </div>
);

const PortalCard: React.FC<{
  category: string;
  title: string;
  passages: string;
  bg: string;
  onClick: () => void;
}> = ({ category, title, passages, bg, onClick }) => (
  <button
    onClick={onClick}
    className="portal-card relative h-96 rounded-[48px] overflow-hidden group border border-white/5 active:scale-95 transition-all w-full"
    style={{ backgroundImage: `url(${bg})` }}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:via-black/20 transition-all duration-700 z-[2]"></div>
    <div className="absolute bottom-0 left-0 p-10 text-left z-[3] w-full">
      <div className="text-[10px] uppercase font-black tracking-[0.4em] text-amber-500 mb-3 drop-shadow-lg">
        {category}
      </div>
      <h3 className="serif-text text-4xl text-white mb-3 leading-tight group-hover:translate-x-2 transition-transform duration-500 drop-shadow-lg">
        {title}
      </h3>
      <div className="flex items-center space-x-3 text-neutral-400">
        <span className="w-8 h-px bg-white/20"></span>
        <p className="text-xs italic font-light tracking-wide">{passages}</p>
      </div>
    </div>
  </button>
);
