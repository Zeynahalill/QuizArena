import { Link } from "react-router";
import {
  ArrowRight,
  Settings,
  Users,
  Monitor,
  PencilLine,
  Gamepad2,
  Timer,
  Trophy,
  Plus,
} from "lucide-react";
import {
  AdminShell,
  DemoNote,
  Heading,
  Logo,
  Surface,
  TrophyArt,
} from "./ArenaShared";
import { arena, useArena } from "./arenaStore";
export default function HomePage() {
  return (
    <Surface className="ar-home">
      <header className="ar-home-header">
        <Logo />
        <span className="ar-header-divider" />
        <span className="ar-platform">
          <i />
          Quiz Platform
        </span>
      </header>
      <section className="ar-hero">
        <div className="ar-hero-copy">
          <h1>
            Ready to <span>Challenge</span>
            <br />
            Your <span>Knowledge?</span>
          </h1>
          <p>
            Join the competition, test your skills,
            <br />
            and climb the leaderboard.
          </p>
          <div className="ar-short-line" />
        </div>
        <TrophyArt />
      </section>
      <section className="ar-entry-grid" aria-label="Choose your experience">
        {[
          {
            to: "/admin",
            title: "Dashboard",
            text: (
              <>
                Create quizzes and
                <br />
                manage your competitions.
              </>
            ),
            button: "Open Dashboard",
            icon: Settings,
            color: "purple",
          },
          {
            to: "/join",
            title: "Join Game",
            text: (
              <>
                Enter your game PIN
                <br />
                and compete with others.
              </>
            ),
            button: "Join Game",
            icon: Users,
            color: "blue",
          },
          {
            to: "/main",
            title: "Main Screen",
            text: (
              <>
                Display the live competition
                <br />
                on a large screen.
              </>
            ),
            button: "Open Main Screen",
            icon: Monitor,
            color: "cyan",
          },
        ].map(({ to, title, text, button, icon: Icon, color }) => (
          <article className={`ar-entry ar-entry-${color}`} key={to}>
            <div className="ar-entry-icon">
              <Icon />
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
            <Link className="ar-button" to={to}>
              {button}
              <ArrowRight />
            </Link>
          </article>
        ))}
      </section>
      <footer className="ar-home-footer">
        <span />
        <i />
        <i />
        <i />
        <span />
      </footer>
      <div className="ar-home-demo">
        <DemoNote />
      </div>
    </Surface>
  );
}
export function Dashboard() {
  const s = useArena();
  return (
    <AdminShell>
      <Heading
        icon={<Gamepad2 />}
        title="Your Quiz Arena"
        description="Create a challenge. Bring everyone together."
      >
        <Link className="ar-button" to="/admin/quizzes">
          <Plus />
          Edit Quiz
        </Link>
      </Heading>
      <div className="ar-dashboard-hero ar-card">
        <div>
          <span className="ar-eyebrow">READY FOR THE NEXT CHALLENGE?</span>
          <h2>
            Big ideas.
            <br />
            <span>Brilliant competition.</span>
          </h2>
          <p>
            Your next game starts here. Set up your questions,
            <br />
            invite your players, and let the challenge begin.
          </p>
          <Link className="ar-button" to="/admin/game">
            Open Game Management
            <ArrowRight />
          </Link>
        </div>
        <TrophyArt />
      </div>
      <div className="ar-stats">
        <article className="ar-card">
          <PencilLine />
          <div>
            <span>Quiz Questions</span>
            <strong>{s.quiz.questions.length}</strong>
          </div>
        </article>
        <article className="ar-card">
          <Users />
          <div>
            <span>Participants</span>
            <strong>{s.players.length} / 100</strong>
          </div>
        </article>
        <article className="ar-card">
          <Timer />
          <div>
            <span>Game PIN</span>
            <strong>{s.pin}</strong>
          </div>
        </article>
        <article className="ar-card">
          <Trophy />
          <div>
            <span>Room Status</span>
            <strong className="ar-capitalize">{s.status}</strong>
          </div>
        </article>
      </div>
      <div className="ar-card ar-quiz-summary">
        <div className="ar-heading-icon">
          <PencilLine />
        </div>
        <div>
          <span className="ar-eyebrow">YOUR QUIZ</span>
          <h2>{s.quiz.title}</h2>
          <p>
            {s.quiz.questions.length} questions ·{" "}
            {s.quiz.questions.reduce((a, q) => a + q.seconds, 0)} seconds total
          </p>
        </div>
        <Link to="/admin/quizzes" className="ar-button ar-button-ghost">
          Edit Quiz
        </Link>
        <button
          className="ar-button"
          onClick={() => {
            arena.reset();
          }}
        >
          Open New Lobby
        </button>
      </div>
    </AdminShell>
  );
}
