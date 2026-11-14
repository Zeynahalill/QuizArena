import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import SparkleIcon from '../../shared/components/SparkleIcon'
import { loginAdmin } from './api'
import { useAdminAuth } from './useAdminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setToken = useAdminAuth((s) => s.setToken)

  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError(null)
    try {
      setToken(await loginAdmin(password))
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-arena-bg px-5 py-10">
      {/* background swooshes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-32 h-96 w-[34rem] -rotate-12 rounded-[50%] bg-arena-violet/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-[40rem] rotate-12 rounded-[50%] bg-arena-indigo/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-[30rem] rounded-[50%] bg-arena-cyan/15 blur-3xl" />
      </div>
      <SparkleIcon className="absolute left-1/2 top-[18%] hidden size-5 -translate-x-1/2 opacity-80 md:block" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
        {/* left: brand */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="flex items-center gap-3">
            <SparkleIcon className="size-14 drop-shadow-[0_0_18px_rgba(129,140,248,0.8)]" />
            <h1 className="text-5xl font-extrabold tracking-tight">
              Quiz
              <span className="bg-gradient-to-r from-arena-violet to-arena-cyan bg-clip-text text-transparent">
                Arena
              </span>
            </h1>
          </div>
          <p className="mt-4 text-xl font-semibold text-white/90">Admin Access</p>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Sign in to manage your quizzes and competitions
          </p>
        </motion.section>

        {/* right: login card */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto w-full max-w-sm rounded-3xl bg-white/5 px-7 pb-8 pt-14 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl"
        >
          <div className="absolute left-1/2 top-0 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-arena-bg ring-1 ring-white/20">
            <Lock className="size-7 text-arena-indigo" />
          </div>

          <h2 className="text-center text-2xl font-bold">Admin Login</h2>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-arena-bg/60 px-4 py-3 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-arena-indigo">
              <Lock className="size-4 shrink-0 text-white/50" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
                aria-label="Password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="text-white/50 hover:text-white"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arena-violet to-arena-indigo py-3 font-semibold shadow-lg shadow-arena-violet/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
        </motion.section>
      </div>
    </main>
  )
}
