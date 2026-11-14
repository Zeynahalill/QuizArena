import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, CloudRain, Timer, Trophy, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'

/* =====================================================================
 * Section 2 – player quiz screens: Question → Correct / Incorrect result.
 * Self-contained (no extra component files) so it works anywhere under
 * src/features/quiz-play/. Question & feedback media are GIFs: drop files in
 * public/gifs/ and set `gifSrc` / the *_GIF constants; a styled fallback is
 * shown when a GIF is missing.
 * ===================================================================== */

type Question = {
  id: number
  text: string
  highlight?: string // part of the title shown in purple
  gifSrc?: string // question GIF, e.g. '/gifs/ros.gif'
  gifLabel?: string // text shown in the fallback frame
  options: string[]
  correctIndex: number
}

const SECONDS_PER_QUESTION = 20
const POINTS_PER_QUESTION = 100
const CORRECT_GIF = '/gifs/correct.gif'
const INCORRECT_GIF = '/gifs/incorrect.gif'

// Demo data – replace with the questions coming from the game server.
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'What is ROS?',
    highlight: 'ROS',
    gifSrc: '/gifs/ros.gif',
    gifLabel: 'ROS',
    options: ['Robot Operating System', 'Robotic Operating System', 'Real Open Source', 'Robot OS'],
    correctIndex: 0,
  },
  {
    id: 2,
    text: 'Which command starts a ROS launch file?',
    highlight: 'launch file',
    gifSrc: '/gifs/launch.gif',
    gifLabel: 'launch',
    options: ['rosrun', 'roslaunch', 'rostopic', 'rosnode'],
    correctIndex: 1,
  },
  {
    id: 3,
    text: 'What is Gazebo used for?',
    highlight: 'Gazebo',
    gifSrc: '/gifs/gazebo.gif',
    gifLabel: 'Gazebo',
    options: ['Robot simulation', 'Video editing', 'Database storage', 'Web hosting'],
    correctIndex: 0,
  },
]

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/* ------------------------------ shared bits ------------------------------ */

function StarMark({ className = '' }: { className?: string }) {
  const id = `sm-${useId().replace(/:/g, '')}`
  return (
    <svg
      viewBox="80 60 450 485"
      className={`overflow-visible drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0.25" y1="0" x2="0.65" y2="1">
          <stop offset="0" stopColor="#22e4fd" />
          <stop offset="0.45" stopColor="#3b9bff" />
          <stop offset="0.75" stopColor="#6a3df8" />
          <stop offset="1" stopColor="#7c2df0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        fillRule="evenodd"
        d="M305 70Q322 262 520 295Q322 328 298 535Q282 328 88 320Q284 270 305 70Z
           M300 246Q303 292 350 298Q304 305 300 348Q296 305 252 298Q296 291 300 246Z"
      />
    </svg>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <StarMark className="size-9" />
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-white">Quiz</span>
        <span className="text-[#7c4ff0]">Arena</span>
      </span>
    </div>
  )
}

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

type Tone = 'blue' | 'violet' | 'pink'

/** Soft wave ribbons in the bottom corners of a panel. */
function Waves({ tone = 'blue' }: { tone?: Tone }) {
  const c = {
    blue: ['#1d4ed8', '#38bdf8'],
    violet: ['#5b21d6', '#a855f7'],
    pink: ['#be185d', '#f472b6'],
  }[tone]
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 600V500C80 470 180 520 260 600Z" fill={c[0]} fillOpacity="0.35" />
      <path d="M0 500C80 470 180 520 260 600" fill="none" stroke={c[1]} strokeOpacity="0.5" strokeWidth="2" />
      <path d="M800 600V470C720 450 620 500 540 600Z" fill={c[0]} fillOpacity="0.35" />
      <path d="M800 470C720 450 620 500 540 600" fill="none" stroke={c[1]} strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  )
}

/** Game panel: rounded frame with a glowing border. */
function Panel({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  const border = {
    blue: 'border-indigo-400/40 shadow-[0_0_50px_rgba(79,70,229,0.22)]',
    violet: 'border-violet-400/40 shadow-[0_0_50px_rgba(124,58,237,0.25)]',
    pink: 'border-pink-400/35 shadow-[0_0_50px_rgba(236,72,153,0.22)]',
  }[tone]
  return (
    <div
      className={`relative mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border bg-[#020a38]/90 ${border}`}
    >
      <Waves tone={tone} />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  )
}

/** GIF frame with a graceful fallback when the file is missing. */
function MediaFrame({
  src,
  alt,
  fallback,
  className = '',
}: {
  src?: string
  alt: string
  fallback: ReactNode
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-blue-400/40 bg-gradient-to-br from-[#06165f] via-[#0a2a9e]/60 to-[#06165f] shadow-[0_0_30px_rgba(59,130,246,0.25)] ${className}`}
    >
      {src && !failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center">{fallback}</div>
      )}
    </div>
  )
}

/* ---------------------------- question screen ---------------------------- */

function QuestionScreen({
  question,
  index,
  total,
  secondsLeft,
  selected,
  onSelect,
}: {
  question: Question
  index: number
  total: number
  secondsLeft: number
  selected: number | null
  onSelect: (i: number) => void
}) {
  const { text, highlight } = question
  const parts = highlight && text.includes(highlight) ? text.split(highlight) : [text]

  return (
    <Panel>
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-400/30 bg-[#050d4a]/60 px-4 py-2 text-lg font-semibold">
          <Timer className="size-5" />
          <span className={secondsLeft <= 5 ? 'text-rose-300' : ''}>{formatTime(secondsLeft)}</span>
        </div>
      </header>

      <div className="relative px-6 pb-8 pt-8 sm:px-10">
        {/* decorative marks */}
        <span className="pointer-events-none absolute left-5 top-14 -rotate-12 text-7xl font-extrabold text-indigo-500/40">?</span>
        <span className="pointer-events-none absolute right-5 top-20 rotate-12 text-6xl font-extrabold text-indigo-500/40">?</span>
        <Sparkle className="pointer-events-none absolute left-[26%] top-16 size-3 text-indigo-400/70" />
        <Sparkle className="pointer-events-none absolute left-6 top-56 size-4 text-indigo-400/70" />
        <Sparkle className="pointer-events-none absolute right-6 top-60 size-4 text-indigo-400/70" />

        <div className="flex justify-center">
          <span className="rounded-full border border-violet-400/40 bg-gradient-to-r from-[#3b1a8f] to-[#4a2bc4] px-6 py-2 text-base font-medium">
            Question {index + 1} / {total}
          </span>
        </div>

        <h2 className="mt-6 text-center text-4xl font-extrabold leading-tight sm:text-5xl">
          {parts.length === 2 ? (
            <>
              {parts[0]}
              <span className="text-[#7c4ff0]">{highlight}</span>
              {parts[1]}
            </>
          ) : (
            text
          )}
        </h2>

        <MediaFrame
          src={question.gifSrc}
          alt={question.text}
          className="mt-8 h-44 sm:h-52"
          fallback={
            <div className="flex items-center gap-5 text-5xl font-medium text-sky-200 drop-shadow-[0_0_18px_rgba(125,211,252,0.8)] sm:text-7xl">
              <span className="grid grid-cols-3 gap-2" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="size-3 rounded-full bg-sky-200 sm:size-4" />
                ))}
              </span>
              {question.gifLabel ?? ''}
            </div>
          }
        />

        <div className="mt-6 flex flex-col gap-4">
          {question.options.map((opt, i) => {
            const active = selected === i
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(i)}
                className={`flex items-center gap-6 rounded-2xl border px-5 py-4 text-left text-lg transition ${
                  active
                    ? 'border-cyan-300 bg-blue-600/30 shadow-[0_0_28px_rgba(56,189,248,0.45)]'
                    : 'border-indigo-400/25 bg-[#0a1245]/70 hover:border-cyan-300/70 hover:bg-blue-600/20'
                }`}
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-full text-xl font-semibold ring-1 ${
                    active ? 'bg-cyan-400/20 ring-cyan-300' : 'bg-indigo-500/25 ring-indigo-300/25'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}

/* ----------------------------- result screen ----------------------------- */

const CONFETTI = [
  { x: '6%', y: '22%', r: 30, c: '#facc15', w: 18, h: 6 },
  { x: '12%', y: '8%', r: -40, c: '#34d399', w: 14, h: 5 },
  { x: '4%', y: '52%', r: 60, c: '#f472b6', w: 16, h: 6 },
  { x: '18%', y: '88%', r: -20, c: '#facc15', w: 16, h: 6 },
  { x: '80%', y: '14%', r: 50, c: '#34d399', w: 12, h: 5 },
  { x: '92%', y: '40%', r: -30, c: '#fb923c', w: 14, h: 5 },
  { x: '86%', y: '84%', r: 20, c: '#facc15', w: 14, h: 5 },
  { x: '50%', y: '-2%', r: 15, c: '#38bdf8', w: 10, h: 4 },
]

function ResultScreen({
  correct,
  answerLabel,
  points,
  onContinue,
}: {
  correct: boolean
  answerLabel: string
  points: number
  onContinue: () => void
}) {
  const ok = correct
  return (
    <Panel tone={ok ? 'blue' : 'pink'}>
      <header className="flex items-center justify-between px-6 py-4 sm:px-8">
        <Brand />
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold ${
            ok
              ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
              : 'border-indigo-400/30 bg-[#0a1245]/60 text-indigo-100'
          }`}
        >
          <Trophy className={`size-5 ${ok ? 'text-amber-400' : 'text-indigo-200'}`} />
          {ok ? `+${points} pts` : '0 pts'}
        </div>
      </header>

      <div className="grid items-center gap-8 px-6 pb-10 pt-4 sm:px-10 md:grid-cols-[auto_1fr]">
        {/* status circle */}
        <div className="relative mx-auto grid size-52 place-items-center sm:size-60">
          {CONFETTI.map((p, i) =>
            ok ? (
              <span
                key={i}
                className="absolute rounded-[2px]"
                style={{ left: p.x, top: p.y, width: p.w, height: p.h, background: p.c, transform: `rotate(${p.r}deg)` }}
              />
            ) : (
              <X
                key={i}
                className="absolute size-4 text-rose-400/80"
                style={{ left: p.x, top: p.y, transform: `rotate(${p.r}deg)` }}
              />
            ),
          )}
          <span className={`absolute inset-0 rounded-full border ${ok ? 'border-emerald-400/25' : 'border-rose-400/25'}`} />
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className={`grid size-40 place-items-center rounded-full border-[10px] sm:size-44 ${
              ok
                ? 'border-emerald-300 bg-[radial-gradient(circle,#10b981,#065f46)] shadow-[0_0_70px_rgba(16,185,129,0.6)]'
                : 'border-rose-300 bg-[radial-gradient(circle,#fb4565,#9f1239)] shadow-[0_0_70px_rgba(244,63,94,0.6)]'
            }`}
          >
            {ok ? (
              <Check className="size-20 text-white" strokeWidth={4} />
            ) : (
              <X className="size-20 text-white" strokeWidth={4} />
            )}
          </motion.div>
        </div>

        {/* details */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <div
            className={`flex items-center gap-3 rounded-2xl border px-6 py-3 text-3xl font-bold ${
              ok
                ? 'border-emerald-400/40 bg-emerald-900/40'
                : 'border-rose-400/40 bg-rose-900/50'
            }`}
          >
            <span className={`grid size-8 place-items-center rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {ok ? <Check className="size-5" strokeWidth={4} /> : <X className="size-5" strokeWidth={4} />}
            </span>
            {ok ? 'Correct!' : 'Incorrect!'}
          </div>

          <p className="text-sm text-indigo-100/80">The correct answer is:</p>
          <div className="rounded-full border border-indigo-400/40 bg-[#0a1245]/80 px-6 py-2 text-lg font-medium">
            {answerLabel}
          </div>

          <MediaFrame
            src={ok ? CORRECT_GIF : INCORRECT_GIF}
            alt={ok ? 'Celebration' : 'Better luck next time'}
            className="mt-2 h-36 w-full max-w-sm"
            fallback={
              ok ? (
                <Trophy className="size-20 text-amber-400 drop-shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
              ) : (
                <CloudRain className="size-20 text-indigo-100 drop-shadow-[0_0_20px_rgba(165,180,252,0.8)]" />
              )
            }
          />

          <button
            type="button"
            onClick={onContinue}
            className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7a35ff] to-[#4f46e5] px-8 py-3 text-lg font-semibold shadow-[0_8px_30px_rgba(91,63,248,0.45)] transition hover:brightness-110"
          >
            Continue <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </Panel>
  )
}

/* --------------------------------- page --------------------------------- */

export default function QuizPlayPage() {
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState<'question' | 'result'>('question')
  const [selected, setSelected] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION)

  const question = QUESTIONS[qIndex]
  const isCorrect = selected === question.correctIndex

  // countdown – when it reaches 0 the question is closed without an answer
  useEffect(() => {
    if (phase !== 'question') return
    const t = setTimeout(() => {
      if (secondsLeft <= 1) {
        setSecondsLeft(0)
        setPhase('result')
      } else {
        setSecondsLeft((s) => s - 1)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [phase, secondsLeft])

  const handleSelect = (i: number) => {
    if (phase !== 'question') return
    setSelected(i)
    setTimeout(() => setPhase('result'), 350)
  }

  const handleContinue = () => {
    setQIndex((i) => (i + 1) % QUESTIONS.length)
    setSelected(null)
    setSecondsLeft(SECONDS_PER_QUESTION)
    setPhase('question')
  }

  return (
    <main className="flex min-h-svh flex-col justify-center bg-[radial-gradient(ellipse_at_top,#06124f_0%,#000828_60%)] px-3 py-4 font-sans text-white sm:px-6 sm:py-8">
      <AnimatePresence mode="wait">
        <motion.div
          className="w-full"
          key={`${qIndex}-${phase}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {phase === 'question' ? (
            <QuestionScreen
              question={question}
              index={qIndex}
              total={QUESTIONS.length}
              secondsLeft={secondsLeft}
              selected={selected}
              onSelect={handleSelect}
            />
          ) : (
            <ResultScreen
              correct={isCorrect}
              answerLabel={`${LETTERS[question.correctIndex]}. ${question.options[question.correctIndex]}`}
              points={POINTS_PER_QUESTION}
              onContinue={handleContinue}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
