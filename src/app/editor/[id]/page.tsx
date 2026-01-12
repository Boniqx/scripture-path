"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { StudyEditor } from "@/components/editor/StudyEditor";
import { generateStudyImage } from "@/services/geminiServiceMock";
import { regenerateSectionAction } from "@/actions/regenerateSection";
import { useAuth } from "@/providers/AuthProvider";
import { PersistenceService } from "@/services/persistenceService";
import { SectionSkeleton } from "@/components/Skeleton";
import { BibleStudy, UserTier } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { main, div } from "framer-motion/client";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, tier } = useAuth();

  const [study, setStudy] = useState<BibleStudy | null>(null);
  const [activeSection, setActiveSection] = useState<string>("theme_summary");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Load from PersistenceService
    let found = PersistenceService.getStudyById(id);

    // Check fallback for mock data if not found (e.g. freshly generated in memory but logic differs? PersistenceService should handle it if localStorage works)
    // For now assume PersistenceService works.

    if (found) {
      if (found.metadata.isLocked) {
        router.push(`/study/${id}`);
      } else {
        setStudy(found);
        // Default mock sections if none exist (for the mock generator)
        if (!found.content || Object.keys(found.content).length === 0) {
          // Shim content for the mock
          const mockSections = [
            {
              sectionId: "theme_summary",
              title: "Thematic Overview",
              content: `## The Grace of God\n\nIn this study, we explore the depths of divine favor...`,
            },
            {
              sectionId: "biblical_analysis",
              title: "Biblical Analysis",
              content: `### Exegesis of Romans 8\n\nThe Greek term *charis* implies...`,
            },
            {
              sectionId: "application",
              title: "Modern Application",
              content: `> "Grace is not just pardon, it is power."\n\n- Live confidently.\n- Forgive others.`,
            },
          ];
          // @ts-ignore - Shim for UI dev
          setStudy({ ...found, sections: mockSections });
        } else if (!("sections" in found)) {
          // Map content object to array if needed, or if mock generator returned object
          // content: { theme_summary: "..." } -> sections array
          const sections = Object.entries(found.content)
            .map(([k, v]) => ({
              sectionId: k,
              title: k.replace(/_/g, " ").toUpperCase(),
              content: v as string,
            }))
            .filter((s) => typeof s.content === "string");
          // @ts-ignore
          setStudy({ ...found, sections });
        }
      }
    } else {
      router.push("/dashboard");
    }
  }, [id, router]);

  const handleUpdateSection = (sectionId: string, newContent: string) => {
    if (!study) return;
    // @ts-ignore
    const updatedSections = study.sections.map((s: any) =>
      s.sectionId === sectionId ? { ...s, content: newContent } : s
    );
    // @ts-ignore
    const updatedStudy = { ...study, sections: updatedSections };
    setStudy(updatedStudy);
    setHasUnsavedChanges(true);
    PersistenceService.saveStudy(updatedStudy);
  };

  const togglePublic = () => {
    if (!study) return;
    if (!user) {
      alert(
        "Only registered members can publish studies to the global registry."
      );
      return;
    }
    const updated = {
      ...study,
      metadata: { ...study.metadata, isPublic: !study.metadata.isPublic },
    };
    setStudy(updated);
    setHasUnsavedChanges(true);
    PersistenceService.saveStudy(updated);
  };

  const handleSave = () => {
    if (study) {
      if (!user) {
        // Guest save is auto-handled by PersistenceService in this mock, but we prompt login
        router.push("/login"); // Or dashboard to see prompt
        return;
      }
      PersistenceService.saveStudy(study);
      setHasUnsavedChanges(false);
    }
  };

  const handleStartStudy = async () => {
    if (study) {
      setIsStarting(true);
      try {
        let imageUrl = study.metadata.imageUrl;
        // Premium feature: Unique AI Image Generation
        if (tier === UserTier.SCRIBE && !imageUrl) {
          imageUrl = await generateStudyImage(
            study.metadata.title,
            study.metadata.theme
          );
        }

        const lockedStudy = {
          ...study,
          metadata: { ...study.metadata, isLocked: true, imageUrl },
        };
        PersistenceService.saveStudy(lockedStudy);
        router.push(`/study/${id}`);
      } catch (e) {
        // Fallback
        const lockedStudy = {
          ...study,
          metadata: { ...study.metadata, isLocked: true },
        };
        PersistenceService.saveStudy(lockedStudy);
        router.push(`/study/${id}`);
      } finally {
        setIsStarting(false);
      }
    }
  };

  const handleRegenerate = async (sectionId: string) => {
    if (!study) return;
    setIsRegenerating(sectionId);
    try {
      // @ts-ignore - Handle metadata access safely
      const context = {
        title: study.metadata.title,
        theme: study.metadata.theme,
        passages: study.metadata.passages,
      };

      // @ts-ignore - finding current content
      const currentContent = study.sections.find(
        (s: any) => s.sectionId === sectionId
      )?.content;

      const newContent = await regenerateSectionAction(
        sectionId,
        context,
        currentContent,
        tier
      );
      handleUpdateSection(sectionId, newContent);
    } catch (e) {
      console.error(e);
      alert("Regeneration failed.");
    } finally {
      setIsRegenerating(null);
    }
  };

  if (!study)
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <SectionSkeleton />
      </div>
    );

  // @ts-ignore - Handle the patched 'sections' property for this view
  const sections = study.sections || [];

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden selection:bg-amber-600/30">
      {isStarting && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-md">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
            <h2 className="serif-text text-4xl font-light text-white mb-4">
              Illuminating the Word
            </h2>
            <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.4em]">
              Finalizing Theological Structures...
            </p>
            {tier === UserTier.SCRIBE && (
              <p className="text-amber-500 text-[9px] font-black uppercase mt-4 tracking-widest">
                Generating Custom Biblical Art Illustrations...
              </p>
            )}
          </div>
        </div>
      )}

      <aside className="w-80 bg-[#0d0d0d] border-r border-white/5 flex flex-col shadow-2xl">
        <div className="p-10 border-b border-white/5 space-y-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="hover:scale-105 transition-transform active:scale-95 origin-left"
          >
            <Logo size="sm" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 block mb-2">
              Active Draft
            </span>
            <h4 className="serif-text text-2xl text-white truncate leading-tight">
              {study.metadata.title}
            </h4>
          </div>
        </div>

        <nav className="flex-grow overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {sections.map((s: any) => (
            <button
              key={s.sectionId}
              onClick={() => {
                setActiveSection(s.sectionId);
                document
                  .getElementById(`editor-section-${s.sectionId}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-xs transition-all",
                activeSection === s.sectionId
                  ? "bg-amber-600/10 text-amber-500 font-bold"
                  : "text-neutral-600 hover:text-neutral-300"
              )}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black tracking-widest text-neutral-600">
                Public Access
              </span>
              {!user && (
                <span className="text-[8px] text-amber-500/50 uppercase font-bold tracking-tighter">
                  Member Only
                </span>
              )}
            </div>
            <button
              onClick={togglePublic}
              disabled={!user}
              className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                study.metadata.isPublic ? "bg-amber-600" : "bg-neutral-800",
                !user && "opacity-30 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  study.metadata.isPublic ? "left-6" : "left-1"
                )}
              ></div>
            </button>
          </div>
          <Button
            variant="primary"
            className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20"
            onClick={handleStartStudy}
          >
            Accept & Finalize
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            onClick={handleSave}
            disabled={user ? !hasUnsavedChanges : false}
          >
            {user
              ? hasUnsavedChanges
                ? "Update Draft"
                : "Saved"
              : "Login to Save"}
          </Button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto bg-[#0a0a0a] custom-scrollbar px-10 py-20 pb-40">
        <div className="max-w-3xl mx-auto space-y-32">
          {!user && (
            <div className="p-8 bg-amber-600/5 border border-amber-600/20 rounded-[32px] flex items-center justify-between animate-fade-in mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  Guest Session Active
                </p>
                <p className="text-neutral-400 text-sm">
                  Create an account to preserve this study and share it by ID.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="rounded-full px-6"
              >
                Login / Save
              </Button>
            </div>
          )}

          <header className="space-y-8">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
                Theological Draft
              </span>
              <span className="text-neutral-700 text-[9px] font-black uppercase tracking-widest">
                Temporary ID: {study.metadata.id.split("-")[0]}...
              </span>
            </div>
            <h1 className="serif-text text-7xl font-light text-white leading-tight tracking-tighter">
              {study.metadata.title}
            </h1>
            <p className="text-neutral-500 text-lg font-light leading-relaxed serif-text italic">
              "{study.metadata.theme}"
            </p>
          </header>

          <div className="space-y-24">
            {sections.map((section: any) => (
              <section
                key={section.sectionId}
                id={`editor-section-${section.sectionId}`}
                className="scroll-mt-32 animate-fade-in group"
              >
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                  <h2 className="serif-text text-3xl font-medium text-neutral-200">
                    {section.title}
                  </h2>
                  <div className="flex items-center space-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRegenerate(section.sectionId)}
                      className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 disabled:opacity-30"
                    >
                      AI Re-Reason
                    </button>
                    <button
                      onClick={() =>
                        setIsEditing(
                          isEditing === section.sectionId
                            ? null
                            : section.sectionId
                        )
                      }
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-300"
                    >
                      {isEditing === section.sectionId
                        ? "Finalize"
                        : "Refine Manually"}
                    </button>
                  </div>
                </div>

                {isRegenerating === section.sectionId ? (
                  <SectionSkeleton />
                ) : isEditing === section.sectionId ? (
                  <div className="bg-[#0d0d0d] border border-amber-600/30 rounded-[32px] p-6 shadow-inner min-h-[400px]">
                    <StudyEditor
                      content={section.content}
                      editable={true}
                      onChange={(html) =>
                        handleUpdateSection(section.sectionId, html)
                      }
                    />
                  </div>
                ) : (
                  <div className="presentation-body px-2">
                    {section.content ? (
                      <StudyEditor content={section.content} editable={false} />
                    ) : (
                      <span className="italic text-neutral-700">
                        Awaiting theological data... Click Re-Reason to fix.
                      </span>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
