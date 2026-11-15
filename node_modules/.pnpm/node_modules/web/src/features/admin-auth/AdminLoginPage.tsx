import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import BrandLogo from "../../shared/components/BrandLogo";
import FilledLock from "../../shared/components/FilledLock";
import SparkleIcon from "../../shared/components/SparkleIcon";
import WaveBackground from "../../shared/components/WaveBackground";
import { loginAdmin } from "./api";
import { useAdminAuth } from "./useAdminAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setToken = useAdminAuth((s) => s.setToken);

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      setToken(await loginAdmin(password));
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ar-login relative min-h-svh overflow-hidden bg-[linear-gradient(90deg,#040a40_0%,#010c33_50%,#001143_100%)] font-sans">
      <WaveBackground />

      {/* decorative sparkle + dots */}
      <SparkleIcon className="pointer-events-none absolute left-[41%] top-[17%] hidden size-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] md:block" />
      <span className="pointer-events-none absolute left-[36%] top-[14%] hidden size-1 rounded-full bg-indigo-300 shadow-[0_0_6px_2px_rgba(129,140,248,0.8)] md:block" />
      <span className="pointer-events-none absolute left-[30%] top-[34%] hidden size-1 rounded-full bg-sky-300 shadow-[0_0_6px_2px_rgba(56,189,248,0.8)] md:block" />

      <div className="ar-login-layout relative z-10 mx-auto grid min-h-svh w-full max-w-[1500px] items-center gap-14 px-6 py-12 md:grid-cols-2 md:gap-6">
        {/* left: brand */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="ar-login-brand flex flex-col items-center text-center"
        >
          <BrandLogo className="size-28" />
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="text-white">Quiz</span>
            <span className="text-[#7c4ff0]">Arena</span>
          </h1>
          <p className="mt-5 text-2xl font-semibold text-white">Admin Access</p>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-indigo-100/75">
            Sign in to manage your quizzes and competitions
          </p>
        </motion.section>

        {/* right: login card */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="ar-login-card relative mx-auto mt-10 w-full max-w-md rounded-[28px] border border-indigo-400/35 bg-[#050f45]/55 px-7 pb-4 pt-20 shadow-[0_0_50px_rgba(79,70,229,0.25)] backdrop-blur-xl"
        >
          {/* lock halo */}
          <div className="absolute left-1/2 top-0 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#07104f] shadow-[0_0_45px_rgba(59,91,255,0.4)] ring-1 ring-indigo-400/20">
            <FilledLock className="size-16 drop-shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
          </div>

          <h2 className="text-center text-3xl font-bold text-white">
            Admin Login
          </h2>
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col">
            <div className="flex h-16 items-center gap-8 rounded-2xl border border-indigo-400/40 bg-[#070d4a]/50 px-6 shadow-[0_0_24px_rgba(99,102,241,0.22)] focus-within:border-indigo-300/80">
              <FilledLock tone="soft" className="size-6 shrink-0" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
                aria-label="Password"
                className="w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-indigo-200/55"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="shrink-0 text-white/90 hover:text-white"
              >
                {show ? (
                  <Eye className="size-6" />
                ) : (
                  <EyeOff className="size-6" />
                )}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7a35ff] via-[#5b3ff8] to-[#1fa2f0] text-lg font-semibold text-white shadow-[0_8px_30px_rgba(91,63,248,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 pb-1 text-sm text-indigo-100/85 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
        </motion.section>
      </div>
    </main>
  );
}
