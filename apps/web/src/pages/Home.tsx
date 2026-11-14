import { motion } from 'motion/react'
import { Gamepad2, PlusCircle, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import GifSlot from '../components/GifSlot'

const answers = [
  { label: 'roslaunch', color: 'bg-arena-red' },
  { label: 'rosrun', color: 'bg-arena-blue' },
  { label: 'rostopic', color: 'bg-arena-yellow' },
  { label: 'rosnode', color: 'bg-arena-green' },
]

export default function Home() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')

  const canJoin = pin.length === 6

  const handleJoin = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (canJoin) navigate(`/join?pin=${pin}`)
  }

  return (
    <main className="relative mx-auto flex min-h-svh max-w-6xl flex-col px-5 py-8">
      {/* glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-arena-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-arena-accent/20 blur-3xl" />
      </div>

      {/* header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Gamepad2 className="text-arena-accent" />
          Quiz<span className="text-arena-accent">Arena</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
        >
          <PlusCircle className="size-4" /> Host a quiz
        </button>
      </header>

      <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-2">
        {/* left: hero + join */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
            Learn <span className="text-arena-accent">Gazebo</span> &amp;{' '}
            <span className="text-arena-primary">ROS</span> by playing.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Live robotics quizzes with animated GIF questions. Enter a game PIN to join, or
            create your own quiz.
          </p>

          <form
            onSubmit={handleJoin}
            className="mt-8 flex max-w-md flex-col gap-3 rounded-2xl bg-arena-card p-5 shadow-xl ring-1 ring-white/10"
          >
            <label htmlFor="pin" className="text-sm text-white/60">
              Game PIN
            </label>
            <input
              id="pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="rounded-xl bg-arena-bg px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-arena-primary"
            />
            <button
              type="submit"
              disabled={!canJoin}
              className="flex items-center justify-center gap-2 rounded-xl bg-arena-primary py-3 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap className="size-5" /> Join game
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-white/50">
            <Trophy className="size-4 text-arena-yellow" />
            Compete live and climb the leaderboard.
          </div>
        </motion.section>

        {/* right: GIF question preview */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl bg-arena-card p-4 shadow-2xl ring-1 ring-white/10"
        >
          <p className="mb-3 text-center text-lg font-semibold">
            Which command starts a ROS launch file?
          </p>
          {/* put a real GIF in /public/gifs/sample-question.gif */}
          <GifSlot
            src="/gifs/sample-question.gif"
            alt="Question GIF"
            className="mb-4 h-52 w-full rounded-2xl"
          />
          <div className="grid grid-cols-2 gap-3">
            {answers.map((a) => (
              <div
                key={a.label}
                className={`${a.color} rounded-xl px-3 py-4 text-center font-semibold text-black/80`}
              >
                {a.label}
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
