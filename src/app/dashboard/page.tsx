"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/providers/AuthProvider";
import { PersistenceService } from "@/services/persistenceService";
import { BibleStudy, StudyDifficulty } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, updateProfile, tier } = useAuth();

  // Local state for dashboard data
  const [library, setLibrary] = useState<BibleStudy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);

  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Profile Form State
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editFavoriteBook, setEditFavoriteBook] = useState("");
  const [editFavoritePassage, setEditFavoritePassage] = useState("");

  const [publicTrending, setPublicTrending] = useState<BibleStudy[]>([]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      // Mock data fetching locally for prototype 1:1 feel
      // In real app, this would be supabase query
      const allStudies = PersistenceService.getUserStudies(user.id);
      const trending = PersistenceService.getPublicStudies().slice(0, 6);
      setLibrary(allStudies);
      setPublicTrending(trending);

      // Mock profile loading from auth context (profile)
      // Since we are mocking, we rely on what's available
      setEditName(user.user_metadata?.full_name || "");
      setEditAvatar(user.user_metadata?.avatar_url || "");
    }
  }, [user]);

  const handleIdSearch = () => {
    if (!user) {
      alert("Please login to resolve path IDs.");
      return;
    }
    if (!searchId) return;
    setIsSearchingId(true);

    setTimeout(() => {
      const found = PersistenceService.getStudyById(searchId);
      setIsSearchingId(false);
      if (found) {
        router.push(`/study/${found.metadata.id}`);
      } else {
        alert("Path ID not found in registry.");
      }
    }, 800);
  };

  const handleTogglePublic = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    PersistenceService.toggleVisibility(id);
    // Refresh library
    if (user) setLibrary(PersistenceService.getUserStudies(user.id));
  };

  const handleShareID = (e: React.MouseEvent, studyId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/study/${studyId}`;
    navigator.clipboard.writeText(url);
    PersistenceService.recordShare(studyId);
    alert("Path ID copied to clipboard. Share metric updated.");
  };

  const handleUpdateProfile = () => {
    updateProfile({
      full_name: editName,
      avatar_url: editAvatar,
    });
    setShowProfileEdit(false);
  };

  const difficultyTheme: Record<StudyDifficulty, string> = {
    [StudyDifficulty.INTRO]:
      "border-emerald-500/20 text-emerald-500 shadow-emerald-500/5",
    [StudyDifficulty.INTERMEDIATE]:
      "border-amber-500/20 text-amber-500 shadow-amber-500/5",
    [StudyDifficulty.ADVANCED]:
      "border-rose-500/20 text-rose-500 shadow-rose-500/5",
  };

  const onDelete = (id: string) => {
    PersistenceService.deleteStudy(id);
    if (user) setLibrary(PersistenceService.getUserStudies(user.id));
  };

  const filtered = library.filter(
    (study) =>
      study.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.metadata.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col selection:bg-amber-600/30">
      <header className="p-8 flex justify-between items-center border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-[100] px-12">
        <button
          onClick={() => router.push("/")}
          className="hover:scale-105 transition-transform active:scale-95 origin-left"
        >
          <Logo size="sm" />
        </button>
        <div className="flex items-center space-x-6">
          {user && (
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="flex items-center space-x-4 group hover:bg-white/5 p-2 rounded-2xl transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-white/10 group-hover:border-amber-500/50 transition-colors">
                  <img
                    src={user.user_metadata?.avatar_url || editAvatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-[8px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {tier}
                    </span>
                    <p className="text-xs font-bold text-white leading-none">
                      {user.user_metadata?.full_name}
                    </p>
                  </div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    Creator Studio
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white"
              >
                Logout
              </Button>
              <Button
                onClick={() => router.push("/new")}
                className="rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200"
              >
                New Study
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Creator Studio Modal */}
      {showProfileEdit && user && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-2xl w-full glass p-12 rounded-[48px] border border-white/5 space-y-12 animate-fade-in my-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/20 bg-neutral-900 shadow-2xl">
                    <img
                      src={editAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="serif-text text-4xl text-white">
                    Creator{" "}
                    <span className="italic text-neutral-500">Studio</span>
                  </h3>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em] font-black mt-1">
                    Personalize your Theological Identity
                  </p>
                </div>
              </div>
              <Logo iconOnly size="lg" className="opacity-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-neutral-600 ml-4">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleUpdateProfile}
                className="flex-grow h-16 rounded-2xl font-bold text-lg shadow-2xl shadow-amber-900/20"
              >
                Commit Changes
              </Button>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="px-10 h-16 rounded-2xl text-[10px] uppercase font-black text-neutral-600 hover:text-white transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-6 py-20 space-y-32 pb-40">
        <section className="animate-fade-in">
          <div className="glass p-16 rounded-[64px] border border-amber-600/10 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="space-y-4 max-w-md">
                <h2 className="serif-text text-4xl text-white tracking-tighter">
                  Identify a{" "}
                  <span className="italic text-amber-500">Shared Path</span>
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Enter a unique study ID to resolve it from the Global Registry
                  or your personal archives.
                </p>
              </div>
              <div className="flex w-full md:w-auto items-center gap-4">
                <div className="relative flex-grow min-w-[300px]">
                  <input
                    type="text"
                    placeholder="Path ID (e.g. 550e8400...)"
                    className="w-full bg-black/40 border border-white/10 rounded-[28px] pl-12 pr-4 h-16 text-white text-lg focus:border-amber-500/50 outline-none transition-all shadow-inner"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                  <span className="absolute left-4 top-5 opacity-40">🆔</span>
                </div>
                <Button
                  onClick={handleIdSearch}
                  isLoading={isSearchingId}
                  className="rounded-[28px] h-16 px-12 text-sm font-bold uppercase tracking-widest shadow-2xl"
                >
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PERSONAL ARCHIVE */}
        <section className="space-y-12 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="serif-text text-7xl text-white font-light tracking-tighter leading-none">
                My <span className="italic text-neutral-500">Archives</span>
              </h1>
              <p className="text-neutral-500 uppercase text-[10px] font-black tracking-[0.4em]">
                Personal Library Management
              </p>
            </div>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search archives..."
                className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full pl-12 pr-4 h-12 text-sm text-white focus:border-amber-500/50 outline-none transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-4 top-3.5 text-neutral-600">
                🔍
              </span>
            </div>
          </div>

          {library.length === 0 ? (
            <div className="text-center py-48 border-2 border-dashed border-white/5 rounded-[64px] space-y-8 bg-neutral-900/10">
              <div className="text-8xl opacity-10 animate-pulse">📜</div>
              <div className="space-y-4">
                <p className="text-neutral-500 text-lg tracking-widest uppercase font-bold">
                  Your library is currently silent
                </p>
                <p className="text-neutral-600 text-sm max-w-xs mx-auto">
                  No paths have been recorded in your registry yet.
                </p>
              </div>
              <Button
                onClick={() => router.push("/new")}
                variant="secondary"
                className="rounded-full px-12 h-16"
              >
                Generate Initial Path
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {filtered.map((study) => (
                <div
                  key={study.metadata.id}
                  className="relative group animate-fade-in transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute top-4 right-4 z-[30] flex space-x-2">
                    <button
                      onClick={(e) => handleTogglePublic(e, study.metadata.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                        study.metadata.isPublic
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                          : "bg-neutral-800 text-neutral-500 hover:text-white border border-white/5"
                      )}
                    >
                      {study.metadata.isPublic ? "Public" : "Private"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Permanently expunge this path from your archives?"
                          )
                        )
                          onDelete(study.metadata.id);
                      }}
                      className="p-2 bg-red-950/40 text-red-500 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white rounded-full shadow-xl"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    className={cn(
                      difficultyTheme[
                        study.metadata.difficulty as StudyDifficulty
                      ]
                    )}
                    onClick={() => router.push(`/editor/${study.metadata.id}`)}
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        src={
                          study.metadata.imageUrl ||
                          "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800"
                        }
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                        alt=""
                      />
                    </div>
                    <div className="absolute inset-0 z-10 transition-all duration-700 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:via-black/20"></div>

                    <div className="absolute bottom-0 left-0 p-10 z-20 w-full space-y-6">
                      <div className="flex justify-between items-center">
                        <div
                          className={cn(
                            "text-[10px] uppercase font-black tracking-[0.4em] px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 drop-shadow-lg",
                            difficultyTheme[
                              study.metadata.difficulty as StudyDifficulty
                            ].split(" ")[1]
                          )}
                        >
                          {study.metadata.difficulty} • {study.metadata.length}
                        </div>
                      </div>
                      <h3 className="serif-text text-4xl text-white leading-tight group-hover:translate-x-2 transition-transform duration-500 drop-shadow-2xl">
                        {study.metadata.title}
                      </h3>
                      <p className="text-neutral-400 text-xs italic font-light truncate opacity-60">
                        "{study.metadata.theme}"
                      </p>
                      <div className="h-px w-8 group-hover:w-full transition-all duration-1000 bg-white/10"></div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">
                          ID: {study.metadata.id.split("-")[0]}...
                        </span>
                        <button
                          onClick={(e) => handleShareID(e, study.metadata.id)}
                          className="text-[8px] uppercase tracking-widest font-black text-neutral-500 hover:text-white transition-colors"
                        >
                          Copy ID
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
