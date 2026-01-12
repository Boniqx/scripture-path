"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { StudyEditor } from "@/components/editor/StudyEditor";
import { useAuth } from "@/providers/AuthProvider";
import { PersistenceService } from "@/services/persistenceService";
import { SectionSkeleton } from "@/components/Skeleton";
import { BibleStudy, StudyLength, UserTier } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface QuizQuestion {
  q: string;
  o: string[];
  a: number;
}

export default function PresentationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [study, setStudy] = useState<BibleStudy | null>(null);
  const [activeTab, setActiveTab] = useState<string>("theme_summary");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showOptionalQuiz, setShowOptionalQuiz] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyles, setPillStyles] = useState({ top: 0, height: 0 });

  useEffect(() => {
    if (!id) return;
    let found = PersistenceService.getStudyById(id);

    // Fallback shim for shimmed Editor data
    if (found && !("sections" in found)) {
      // @ts-ignore
      const sections = Object.entries(found.content)
        .map(([k, v]) => ({
          sectionId: k,
          title: k.replace(/_/g, " ").toUpperCase(),
          content: v as string,
        }))
        .filter((s) => typeof s.content === "string");
      // @ts-ignore
      found = { ...found, sections };
    }

    if (found) {
      setStudy(found);
      const viewedKey = `viewed_${id}`;
      // In SSR env, check window
      if (typeof window !== "undefined" && !sessionStorage.getItem(viewedKey)) {
        PersistenceService.recordView(found.metadata.id);
        sessionStorage.setItem(viewedKey, "true");
      }
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!study) return;
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -75% 0px",
      threshold: 0,
    };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        const sectionId = visibleEntry.target.id.replace("study-section-", "");
        setActiveTab(sectionId);
      }
    };
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    // @ts-ignore
    study.sections?.forEach((section: any) => {
      const el = document.getElementById(`study-section-${section.sectionId}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [study]);

  const handleShare = () => {
    if (!study) return;
    const url = `${window.location.origin}/study/${id}`;
    navigator.clipboard.writeText(url);
    PersistenceService.recordShare(study.metadata.id);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleLike = () => {
    if (!study) return;
    PersistenceService.recordLike(study.metadata.id);
    // Force re-render to show updated count? In real app, we use state or swr.
    // For prototype vibe, we just optimistically update local state if we want, or ignore.
    const updatedStats = {
      views: study.metadata.stats?.views || 0,
      clones: study.metadata.stats?.clones || 0,
      shares: study.metadata.stats?.shares || 0,
      likes: (study.metadata.stats?.likes || 0) + 1,
    };
    // @ts-ignore
    setStudy({
      ...study,
      metadata: { ...study.metadata, stats: updatedStats },
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`study-section-${sectionId}`);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({
        top: elementRect - bodyRect - offset,
        behavior: "smooth",
      });
    }
    setIsMobileNavOpen(false);
  };

  const renderQuiz = (content: string) => {
    let questions: QuizQuestion[] = [];
    try {
      questions = JSON.parse(content);
    } catch (e) {
      return (
        <div className="p-10 border border-white/5 bg-neutral-900 rounded-[32px] text-center italic text-neutral-500">
          Quiz content is unavailable or currently regenerating.
        </div>
      );
    }
    // ... Quiz Logic Omitted for brevity, assuming standard text for now or simple port
    // Porting the full quiz logic from prototype:
    if (questions.length === 0) return null;

    const calculateScore = () => {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (quizAnswers[idx] === q.a) correct++;
      });
      return {
        score: correct,
        percent: Math.round((correct / questions.length) * 100),
      };
    };
    const results = quizSubmitted ? calculateScore() : null;

    if (!showOptionalQuiz && !quizSubmitted) {
      // Simplify: just show button
      return (
        <div className="flex flex-col items-center py-20 px-10 text-center space-y-8 glass rounded-[40px] border-amber-500/10">
          <div className="text-4xl">💎</div>
          <div className="space-y-4">
            <h4 className="serif-text text-3xl text-white">
              Reflective Challenge
            </h4>
            <p className="text-neutral-500 max-w-sm mx-auto text-sm leading-relaxed">
              Would you like to test your understanding of this path with a
              concise {questions.length}-question reflection?
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-12 h-14 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-bold"
            onClick={() => setShowOptionalQuiz(true)}
          >
            Take Reflection Quiz
          </Button>
        </div>
      );
    }

    // Render Quiz Form
    return (
      <div className="space-y-12 mt-12 animate-fade-in">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-4">
            <h5 className="text-xl font-bold text-white">
              <span className="text-amber-500 mr-2">{qIdx + 1}.</span> {q.q}
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {q.o.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  disabled={quizSubmitted}
                  onClick={() =>
                    setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })
                  }
                  className={cn(
                    "p-4 rounded-xl border text-left text-sm transition-all",
                    quizAnswers[qIdx] === oIdx
                      ? "bg-amber-600/20 border-amber-500 text-amber-500"
                      : "border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10",
                    quizSubmitted &&
                      q.a === oIdx &&
                      "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!quizSubmitted && (
          <Button onClick={() => setQuizSubmitted(true)} className="w-full">
            Submit Results
          </Button>
        )}
        {quizSubmitted && (
          <div className="p-8 bg-neutral-800 rounded-2xl text-center">
            <h4 className="text-2xl text-white mb-2">
              Score: {results?.percent}%
            </h4>
            <p className="text-neutral-400">
              You got {results?.score} out of {questions.length} correct.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = (content: string, sectionId: string) => {
    if (sectionId === "theological_quiz") {
      return renderQuiz(content);
    }
    return <StudyEditor content={content} editable={false} />;
  };

  if (!study)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-20">
        <SectionSkeleton />
      </div>
    );

  // @ts-ignore
  const sections = study.sections || [];
  // @ts-ignore
  const imageUrl = study.metadata.imageUrl;
  const isOwner = user && study.metadata.ownerId === user.id;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f0] flex flex-col font-light overflow-x-hidden selection:bg-amber-500/30">
      <div
        className="fixed top-0 left-0 h-[3px] bg-amber-600 z-[110] transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {showShareToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
          <div className="bg-amber-600 text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl">
            Path ID copied to clipboard
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-3xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="h-8 w-px bg-white/10"></div>
          <button
            onClick={() => router.push("/")}
            className="hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-[10px] font-black tracking-widest uppercase hover:bg-amber-600/10"
          >
            Share ID
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className="text-[10px] font-black tracking-widest uppercase border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
          >
            ❤️ {study.metadata.stats?.likes || 0} Like
          </Button>
          {!isOwner && (
            <Button
              size="sm"
              onClick={() => {
                // Clone logic: pass state or just use prompt
                if (user) {
                  PersistenceService.saveStudy({
                    ...study,
                    metadata: {
                      ...study.metadata,
                      ownerId: user.id,
                      id: `clone-${Date.now()}`,
                      isLocked: false,
                    },
                  });
                  router.push("/dashboard");
                } else {
                  alert("Login required to clone paths.");
                  router.push("/dashboard");
                }
              }}
              className="text-[10px] font-black tracking-widest uppercase shadow-lg shadow-amber-900/20"
            >
              Clone Path
            </Button>
          )}
          {isOwner && !study.metadata.isLocked && (
            <Button
              size="sm"
              onClick={() => router.push(`/editor/${id}`)}
              className="text-[10px] font-black tracking-widest uppercase"
            >
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row relative">
        <aside className="md:w-80 hidden md:block border-r border-white/5 min-h-screen">
          <div className="sticky top-20 p-12 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
            <div className="relative space-y-1">
              <h5 className="text-[9px] uppercase font-black tracking-[0.4em] text-neutral-700 mb-8 px-4 relative z-10">
                Exploration Roadmap
              </h5>
              {sections.map((s: any, idx: number) => {
                const isActive = activeTab === s.sectionId;
                return (
                  <button
                    key={s.sectionId}
                    id={`nav-btn-${s.sectionId}`}
                    onClick={() => scrollToSection(s.sectionId)}
                    className={cn(
                      "relative flex items-center w-full py-4 px-6 rounded-xl text-xs transition-all z-10 group",
                      isActive
                        ? "text-amber-500 bg-amber-600/5 font-bold"
                        : "text-neutral-600 hover:text-neutral-300"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 font-mono text-[9px]",
                        isActive ? "opacity-100 font-bold" : "opacity-30"
                      )}
                    >
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "truncate tracking-wide",
                        isActive ? "font-bold pl-2" : ""
                      )}
                    >
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-grow flex flex-col items-center">
          <section className="relative pt-40 pb-64 px-6 w-full flex flex-col items-center overflow-hidden">
            {imageUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-30 scale-105 animate-ken-burns"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
              </div>
            )}
            <div className={`max-w-4xl text-center relative z-10 space-y-10`}>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-amber-600/20 bg-amber-600/5 text-[10px] uppercase font-black tracking-[0.5em] text-amber-500">
                The Path Identified
              </div>
              <h1 className="serif-text text-7xl md:text-9xl font-light text-white tracking-tighter leading-none drop-shadow-3xl">
                {study.metadata.title}
              </h1>
              <p className="text-xl md:text-2xl text-neutral-400 font-light italic serif-text max-w-2xl mx-auto leading-relaxed opacity-80">
                "{study.metadata.theme}"
              </p>
            </div>
          </section>

          <div className="max-w-4xl w-full px-6 space-y-32 pb-96">
            {sections.map((section: any) => {
              const isActive = activeTab === section.sectionId;
              const isQuizSection = section.sectionId === "theological_quiz";

              return (
                <article
                  key={section.sectionId}
                  id={`study-section-${section.sectionId}`}
                  className={cn(
                    "transition-all duration-1000 p-10 md:p-24 rounded-[40px] border border-white/5 bg-[#0d0d0d]",
                    isActive
                      ? "scale-100 opacity-100 shadow-3xl"
                      : "scale-[0.96] opacity-30 grayscale blur-[1px]"
                  )}
                >
                  {!isQuizSection && (
                    <header className="mb-16">
                      <div className="inline-flex px-3 py-1 rounded bg-neutral-800 text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-8">
                        {section.sectionId.replace(/_/g, " ")}
                      </div>
                      <h2 className="serif-text text-5xl md:text-7xl font-medium text-white tracking-tighter leading-tight">
                        {section.title}
                      </h2>
                      <div className="h-px bg-white/5 w-full mt-12 opacity-50"></div>
                    </header>
                  )}
                  <div className="presentation-body text-neutral-400">
                    {renderContent(section.content, section.sectionId)}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
