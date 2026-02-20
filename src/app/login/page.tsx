"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 font-sans text-zinc-50 selection:bg-rose-500 selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col items-center justify-center space-y-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
      >
        <div className="flex flex-col items-center space-y-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)]">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Chef Hat"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 15c0-4.418-4.03-8-9-8s-9 3.582-9 8h18zM12 3a3 3 0 00-3 3v1h6V6a3 3 0 00-3-3v0z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Recipe Labels</h1>
            <p className="text-base text-zinc-400">Log in to manage your kitchen labels</p>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="group relative flex h-14 w-full items-center justify-center space-x-3 overflow-hidden rounded-2xl bg-white px-6 font-semibold text-zinc-900 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
          <svg className="z-10 h-6 w-6" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          <span className="z-10 text-lg">
            {isLoggingIn ? "Logging in..." : "Sign in with Google"}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
