"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import {
  StudyDifficulty,
  StudyLength,
  UserTier,
  SECTION_DEFINITIONS,
} from "@/lib/constants";
import {
  suggestStudyPlan,
  generateFullStudy,
  surpriseMe,
} from "@/services/geminiServiceMock";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { generateStudyAction } from "@/actions/generateStudy";
import { PersistenceService } from "@/services/persistenceService";

export default function GeneratorPage() {
  const router = useRouter();
  const { user, tier, updateProfile } = useAuth();

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Initiating Deep Reasoning..."
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [passages, setPassages] = useState("");
  const [difficulty, setDifficulty] = useState<StudyDifficulty>(
    StudyDifficulty.INTERMEDIATE
  );
  const [length, setLength] = useState<StudyLength>(StudyLength.MEDIUM);

  const isScribe = tier === UserTier.SCRIBE;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStep((prev) =>
          prev < SECTION_DEFINITIONS.length ? prev + 1 : prev
        );
        const messages = [
          "Deconstructing Cultural Context...",
          "Analyzing Original Languages...",
          "Synthesizing Cross-References...",
          "Drafting Application Logic...",
          "Finalizing Theological Structures...",
        ];
        setStatusMessage(
          messages[
            Math.min(Math.floor(generationStep / 3), messages.length - 1)
          ]
        );
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationStep]);

  const checkDailyLimit = () => {
    if (isScribe) return true;
    if (!user) return true; // Guests aren't tracked daily yet in mock

    // Mock limit check
    const now = Date.now();
    const lastGen = 0; // In real app, check user.lastGenerationAt
    const dayInMs = 24 * 60 * 60 * 1000;

    if (now - lastGen < dayInMs && false) {
      // Disabled for mock testing
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!topic && !passages) {
      alert("Topic or Passage is required.");
      return;
    }

    if (!isScribe) {
      if (
        difficulty === StudyDifficulty.ADVANCED ||
        length === StudyLength.LONG
      ) {
        alert(
          "Advanced reasoning and Exhaustive depth require a Scribe upgrade."
        );
        setShowUpgradeModal(true);
        return;
      }
      if (!checkDailyLimit()) return;
    }

    setIsGenerating(true);
    try {
      // Call Server Action
      const result = await generateStudyAction(
        title || topic,
        difficulty,
        length
      );

      if (!result.success || !result.study) {
        throw new Error(result.error || "Failed to generate study");
      }

      // Save to Local Storage (Client Side)
      // Note: In real app with logged in user, we might want to save to DB via server action.
      // But preserving prototype behavior "guest mode" -> local storage first.
      if (user) {
        // Overwrite potential guest ownerId with real user id
        result.study.metadata.ownerId = user.id;
        // In future: call saveStudyToSupabase(result.study)
      } else {
        result.study.metadata.ownerId = "guest_temporary";
      }

      PersistenceService.saveStudy(result.study);

      router.push(`/editor/${result.study.metadata.id}`);
    } catch (e) {
      console.error(e);
      console.error(e);
      alert(
        typeof e === "string"
          ? e
          : (e as Error).message ||
              "The logic engine hit a wall. Please try again or simplify your topic."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggest = async () => {
    if (!topic) return;
    setIsSuggesting(true);
    try {
      const plan = await suggestStudyPlan(topic);
      setTitle(plan.title);
      setPassages(plan.passageRefs);
      setDifficulty(plan.difficulty);
      setLength(plan.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsSurprising(true);
    try {
      const plan = await surpriseMe();
      setTopic(plan.title);
      setTitle(plan.title);
      setPassages(plan.passageRefs);
      setDifficulty(plan.difficulty);
      setLength(plan.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSurprising(false);
    }
  };

  const difficultyColors = {
    [StudyDifficulty.INTRO]:
      "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    [StudyDifficulty.INTERMEDIATE]:
      "border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    [StudyDifficulty.ADVANCED]:
      "border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
  };

  const lengthInfo = {
    [StudyLength.SHORT]: "≈ 15 min",
    [StudyLength.MEDIUM]: "≈ 45 min",
    [StudyLength.LONG]: "≈ 90+ min",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center selection:bg-amber-600/30">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-4xl w-full glass rounded-[64px] border border-amber-500/20 p-12 md:p-20 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full"></div>
            <div className="text-center space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                Premium Tier
              </div>
              <h2 className="serif-text text-5xl md:text-7xl text-white">
                Become a{" "}
                <span className="italic text-amber-500 font-bold">Scribe</span>
              </h2>
              <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed">
                Unlock the full capacity of the reasoning engine and immortalize
                your studies with cinematic art.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                <h4 className="text-white font-bold text-lg">Seeker (Free)</h4>
                <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                  <li className="flex items-center space-x-2">
                    <span>✓</span> <span>1 Study per Day</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>✓</span> <span>Intro/Medium Depth</span>
                  </li>
                </ul>
              </div>
              <div className="p-8 bg-amber-600/10 border-2 border-amber-500/40 rounded-3xl space-y-4 shadow-2xl shadow-amber-900/10 relative overflow-hidden group">
                <h4 className="text-amber-500 font-bold text-lg flex justify-between items-center">
                  <span>Scribe Pro</span>
                  <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded">
                    Unlimited
                  </span>
                </h4>
                <ul className="space-y-3 text-xs text-neutral-300 font-bold relative z-10">
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-500">✓</span>{" "}
                    <span>Unlimited Generations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-500">✓</span>{" "}
                    <span>Exhaustive Academic Depth</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6 pt-4">
              <Button
                size="lg"
                className="w-full md:w-80 h-16 rounded-full font-black text-sm uppercase tracking-widest shadow-3xl shadow-amber-900/40"
                onClick={() => {
                  updateProfile({ tier: UserTier.SCRIBE });
                  setShowUpgradeModal(false);
                }}
              >
                Upgrade to Scribe — $9/mo
              </Button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-[10px] uppercase font-black text-neutral-700 hover:text-white transition-colors tracking-widest"
              >
                Continue as Seeker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reasoning Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
          <div className="max-w-xl w-full text-center">
            <div className="mb-16">
              <div className="w-32 h-32 bg-amber-600/10 border border-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping opacity-10"></div>
                <div className="w-16 h-16 text-amber-500 animate-spin border-4 border-amber-500 border-t-transparent rounded-full"></div>
              </div>
              <h2 className="serif-text text-6xl font-light mb-4 text-white tracking-tighter text-center">
                Deeply <span className="italic opacity-60">Reasoning</span>
              </h2>
              <p className="text-amber-500 text-xs uppercase font-black tracking-[0.6em] animate-pulse">
                {statusMessage}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-10 glass rounded-[48px] border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {SECTION_DEFINITIONS.map((s, idx) => (
                <div
                  key={s.sectionId}
                  className="flex items-center text-[10px] uppercase font-bold tracking-widest py-2 px-4 rounded-xl border border-transparent transition-all"
                >
                  <span
                    className={cn(
                      "w-4 mr-4",
                      generationStep > idx
                        ? "text-emerald-500"
                        : generationStep === idx
                        ? "text-amber-500 animate-bounce"
                        : "text-neutral-800"
                    )}
                  >
                    {generationStep > idx ? "✓" : "•"}
                  </span>
                  <span
                    className={cn(
                      generationStep > idx
                        ? "text-neutral-500 line-through"
                        : generationStep === idx
                        ? "text-amber-500"
                        : "text-neutral-800"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="w-full p-8 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5 px-12">
        <button
          onClick={() => router.push("/")}
          className="hover:scale-105 transition-transform active:scale-95 origin-left"
        >
          <Logo size="sm" />
        </button>
        <div className="flex items-center space-x-6">
          {tier === UserTier.SCRIBE ? (
            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
              Scribe Access
            </span>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-[10px] text-neutral-500 hover:text-amber-500 font-black uppercase tracking-widest transition-colors"
            >
              Upgrade to Scribe
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
          >
            Archives
          </Button>
        </div>
      </header>

      <main className="max-w-6xl w-full px-6 py-20 pb-40 space-y-32">
        <div className="text-center space-y-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-600/5 border border-amber-600/10 text-[10px] uppercase font-black tracking-[0.5em] text-amber-500 animate-fade-in">
            Gate of Configuration
          </div>
          <h1 className="serif-text text-8xl md:text-[10rem] font-light text-white tracking-tighter leading-none animate-fade-in">
            Draft a <span className="italic text-neutral-400">Path.</span>
          </h1>
          <p className="text-neutral-500 text-xl font-light italic serif-text max-w-xl mx-auto opacity-80">
            Choose your intensity and scope. The reasoning engine will do the
            rest.
          </p>
        </div>

        <div className="glass rounded-[80px] p-12 md:p-24 border border-white/5 space-y-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

          <div className="space-y-10 relative">
            <div className="flex justify-between items-end px-2">
              <label className="text-[10px] uppercase font-black tracking-[0.6em] text-neutral-600">
                Primary Theme
              </label>
              <button
                onClick={handleSurpriseMe}
                className="flex items-center space-x-2 text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
                disabled={isSurprising}
              >
                <span className={isSurprising ? "animate-spin" : ""}>✨</span>
                <span>Inspire Me</span>
              </button>
            </div>
            <div className="relative group">
              <input
                type="text"
                placeholder="The Grace of God..."
                className="w-full bg-black/40 border border-white/5 rounded-[40px] px-12 h-28 text-white text-4xl md:text-5xl serif-text italic focus:border-amber-500/50 outline-none transition-all shadow-inner placeholder:text-neutral-800"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button
                onClick={handleSuggest}
                isLoading={isSuggesting}
                variant="ghost"
                className="absolute right-8 top-8 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/10"
              >
                Refine Plan
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] uppercase font-black tracking-[0.6em] text-neutral-600 px-2">
              Biblical Baseline
            </label>
            <input
              type="text"
              placeholder="e.g. Luke 15:11-32, Romans 8..."
              className="w-full bg-black/40 border border-white/10 rounded-[28px] px-10 h-20 text-white text-2xl serif-text focus:border-amber-500/50 outline-none transition-all shadow-inner"
              value={passages}
              onChange={(e) => setPassages(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-600 px-2 flex justify-between">
                <span>Reasoning Intensity</span>
                {difficulty === StudyDifficulty.ADVANCED && !isScribe && (
                  <span className="text-amber-500 font-black animate-pulse">
                    Scribe Lock 🔒
                  </span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-4 p-3 bg-black/60 rounded-[32px] border border-white/5">
                {Object.values(StudyDifficulty).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "py-6 rounded-2xl text-[10px] font-black uppercase transition-all border-2",
                      difficulty === d
                        ? difficultyColors[d]
                        : "border-transparent text-neutral-700 hover:text-neutral-500"
                    )}
                  >
                    {d}{" "}
                    {d === StudyDifficulty.ADVANCED && !isScribe ? "🔒" : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-600 px-2 flex justify-between">
                <span>Path Duration</span>
                {length === StudyLength.LONG && !isScribe && (
                  <span className="text-amber-500 font-black animate-pulse">
                    Scribe Lock 🔒
                  </span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-4 p-3 bg-black/60 rounded-[32px] border border-white/5">
                {Object.values(StudyLength).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={cn(
                      "py-6 rounded-2xl flex flex-col items-center justify-center transition-all border-2",
                      length === l
                        ? "border-white/20 bg-white/5 text-white shadow-xl"
                        : "border-transparent text-neutral-700 hover:text-neutral-500"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">
                      {l} {l === StudyLength.LONG && !isScribe ? "🔒" : ""}
                    </span>
                    <span className="text-[8px] opacity-40 font-mono">
                      {lengthInfo[l]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-10">
            <Button
              size="lg"
              className="w-full h-28 rounded-[48px] text-3xl font-bold shadow-3xl shadow-amber-900/30 hover:scale-[1.02] active:scale-95 transition-all"
              onClick={handleGenerate}
            >
              Initialize Path Descent
            </Button>
            {!isScribe && (
              <p className="mt-8 text-center text-amber-500/40 text-[9px] uppercase font-black tracking-[0.4em]">
                {user
                  ? "Standard Seeker limit: 1 generation per 24 hours."
                  : "Guest limit: Local browser storage only (Mocked)."}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
