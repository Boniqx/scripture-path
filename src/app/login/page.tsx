"use client";

import { useState } from "react";
import { login, signup } from "@/actions/auth";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    if (isLogin) {
      const res = await login(formData);
      if (res?.error) setMessage(res.error);
    } else {
      const res = await signup(formData);
      if (res?.error) setMessage(res.error);
      if (res?.success) setMessage(res.success);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 glass p-10 rounded-[40px] shadow-2xl border-white/10">
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center mb-6" />
          <h1 className="serif-text text-3xl font-medium text-white">
            {isLogin ? "Welcome Back" : "Join the Journey"}
          </h1>
          <p className="text-neutral-400 text-sm">
            {isLogin
              ? "Continue your theological exploration."
              : "Unlock the depths of inductive reasoning."}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs uppercase font-black tracking-widest text-neutral-500 ml-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="John Calvin"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-700 focus:border-amber-500/50 outline-none transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase font-black tracking-widest text-neutral-500 ml-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="theologian@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-700 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-black tracking-widest text-neutral-500 ml-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              minLength={6}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-700 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>

          {message && (
            <div
              className={cn(
                "p-4 rounded-xl text-xs font-medium text-center",
                message.includes("Check")
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              )}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
