import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import {
  Check,
  Home,
  Maximize,
  Pause,
  Play,
  Star,
  Sparkles,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { QuestionScreen, ResultScreen } from "../quiz-play/QuizPlayPage";
import { DemoNote, Hourglass, Logo, Podium, Surface } from "./ArenaShared";
import {
  arena,
  PLAYER_KEY,
  ranking,
  useArena,
  useRemaining,
} from "./arenaStore";
import type { Player } from "./arenaStore";
import QR from "./QR";
function LiveQuestionFlow() {
  const s = useArena();
  const seconds = useRemaining();
  const q = s.quiz.questions[s.index];
  const id = sessionStorage.getItem(PLAYER_KEY);
  const p = s.players.find((p) => p.id === id);
  const navigate = useNavigate();
  const [continueClicked, setContinueClicked] = useState(false);
  useEffect(() => {
    if (!p) navigate("/join", { replace: true });
    else if (s.status === "finished") navigate("/results", { replace: true });
    else if (s.status === "waiting") navigate("/lobby", { replace: true });
  }, [s.status, p, navigate]);
  if (!p) return null;
  const selected = p.answers[q.id] ?? null;
  return (
    <main className="quiz-play ar-live-player">
      <div className="qp-stage">
        {s.status === "answer" && !continueClicked ? (
          <ResultScreen
            correct={selected === q.correctIndex}
            timedOut={selected === null}
            answer={`${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex]}`}
            gif={
              selected === q.correctIndex
                ? s.quiz.correctGif
                : s.quiz.incorrectGif
            }
            onContinue={() => setContinueClicked(true)}
            continueLabel="Continue"
          />
        ) : s.status === "paused" || selected !== null || continueClicked ? (
          <section className="ar-live-wait arena">
            <Logo />
            {s.status === "paused" ? (
              <Pause className="ar-wait-symbol" />
            ) : (
              <Check className="ar-wait-symbol" />
            )}
            <h1>
              {s.status === "paused"
                ? "Game Paused"
                : continueClicked
                  ? "Ready for the next question?"
                  : "Answer Sent!"}
            </h1>
            <p>
              {s.status === "paused"
                ? "The host will resume the game shortly."
                : "Wait for the host to continue the competition."}
            </p>
            <div className="ar-live-wait-meta">
              <span>
                Question {s.index + 1} / {s.quiz.questions.length}
              </span>
              <span>{p.score} pts</span>
            </div>
            {s.status === "answer" && q.explanation && <p>{q.explanation}</p>}
          </section>
        ) : (
          <QuestionScreen
            question={q}
            index={s.index}
            total={s.quiz.questions.length}
            seconds={seconds}
            selected={selected}
            onSelect={(i) => arena.answer(p.id, i)}
          />
        )}
        <div className="ar-player-footer">
          {p.name}
          <span>PIN {s.pin} · Local demo</span>
        </div>
      </div>
    </main>
  );
}
export function LivePlayer() {
  const s = useArena();
  return <LiveQuestionFlow key={`${s.round}-${s.index}`} />;
}
const SAMPLE_PLAYERS: Player[] = [
  ["Alya", 980],
  ["Omar", 870],
  ["Lina", 820],
  ["Rami", 760],
  ["Noor", 710],
  ["Yazan", 680],
].map(([name, score], i) => ({
  id: `sample-${i}`,
  name: String(name),
  score: Number(score),
  answers: {},
  demo: true,
}));
function Celebration({ replay }: { replay: number }) {
  return (
    <div key={replay} className="ar-celebration" aria-hidden="true">
      <div className="ar-winner-halo" />
      <div className="ar-winner-beams" />
      {Array.from({ length: 72 }, (_, i) => (
        <i
          key={i}
          className="ar-confetti-piece"
          style={
            {
              "--left": `${2 + ((i * 37) % 96)}%`,
              "--delay": `${(i % 18) * 0.13}s`,
              "--duration": `${4.5 + (i % 7) * 0.35}s`,
              "--drift": `${((i * 23) % 160) - 80}px`,
              "--spin": `${(i % 2 ? 1 : -1) * (360 + (i % 4) * 180)}deg`,
              "--color": [
                "#ffd665",
                "#af63ff",
                "#42d8ff",
                "#ff8ec8",
                "#fff0b8",
              ][i % 5],
              "--width": `${5 + (i % 5)}px`,
              "--height": `${8 + (i % 9)}px`,
            } as CSSProperties
          }
        />
      ))}
      {[0, 1, 2, 3].map((burst) => (
        <div className={`ar-firework ar-firework-${burst}`} key={burst}>
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--angle": `${i * 30}deg`,
                  "--burst-delay": `${0.2 + burst * 0.6}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function Results() {
  const s = useArena();
  const [replay, setReplay] = useState(0);
  const sample = !s.players.length;
  const players = ranking(sample ? SAMPLE_PLAYERS : s.players);
  const finished = s.status === "finished" || sample;
  const winners = players.filter((p) => p.score === players[0]?.score);
  const winnerText =
    winners.length === 1
      ? `${winners[0].name} wins!`
      : `${winners.length} joint winners!`;
  return (
    <Surface
      className={`ar-results ${finished ? "ar-results--celebrating" : ""}`}
    >
      <header>
        <Logo />
        <span className="ar-results-badge">
          <Trophy />
          {finished ? "Final Results" : "Live Leaderboard"}
        </span>
      </header>
      <div className="ar-results-title">
        <h1>{finished ? "Competition Finished!" : "The Competition Is On!"}</h1>
        <div>
          <span />
          <p>
            {finished
              ? "Here are the final results"
              : "Follow the live leaderboard"}
          </p>
          <span />
        </div>
        {finished && (
          <div className="ar-winner-announcement" role="status">
            <Sparkles />
            <strong>{winnerText}</strong>
            <Sparkles />
          </div>
        )}
        {sample && <small>Design preview · sample results</small>}
      </div>
      <div className="ar-results-content">
        <Podium players={players} />
        {players.length > 3 && (
          <div
            className="ar-final-list"
            tabIndex={0}
            role="region"
            aria-label="Remaining rankings"
          >
            {players.slice(3).map((p, i) => (
              <div key={p.id}>
                <span>{i + 4}</span>
                <b>{p.name}</b>
                <strong>
                  <Star fill="currentColor" />
                  {p.score.toLocaleString()} <small>pts</small>
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="ar-results-actions">
        <Link to="/" className="ar-button ar-home-button">
          <Home fill="currentColor" />
          Back to Home
        </Link>
        <div>
          {finished && (
            <button
              className="ar-celebrate-again"
              onClick={() => setReplay((n) => n + 1)}
            >
              <Sparkles />
              Celebrate again
            </button>
          )}
          {!sample && (
            <Link to="/admin/game" className="ar-text-link ar-results-manage">
              Back to Game Management
            </Link>
          )}
        </div>
      </footer>
      {finished && <Celebration replay={replay} />}
    </Surface>
  );
}
export function MainScreen() {
  const s = useArena();
  const seconds = useRemaining();
  const q = s.quiz.questions[s.index];
  const [fullscreenError, setFullscreenError] = useState("");
  const url = new URL(
    `${import.meta.env.BASE_URL}join?pin=${s.pin}`,
    location.origin,
  ).href;
  if (s.status === "finished") return <Results />;
  return (
    <Surface className="ar-main-display">
      <header>
        <Logo />
        <DemoNote />
        <button
          className="ar-button ar-button-ghost ar-button-small"
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await document.documentElement.requestFullscreen();
            } catch {
              setFullscreenError(
                "Full screen is unavailable. Use your browser’s full-screen shortcut.",
              );
            }
          }}
        >
          <Maximize />
          Full Screen
        </button>
      </header>
      {fullscreenError && <p role="status">{fullscreenError}</p>}
      {s.status === "waiting" ? (
        <div className="ar-main-lobby">
          <div>
            <Hourglass />
            <h1>Join the Challenge!</h1>
            <p>Enter the game PIN and get ready to play.</p>
            <strong className="ar-main-pin">{s.pin}</strong>
            <div className="ar-main-count">
              <Users />
              {s.players.length} participants joined
            </div>
          </div>
          <div className="ar-card ar-main-qr">
            <QR value={url} />
            <Link
              to={`/join?pin=${s.pin}`}
              target="_blank"
              className="ar-button"
            >
              Join Game
              <Play />
            </Link>
            <p>
              For this local demo, open the player page in another tab in the
              same browser.
            </p>
          </div>
          <div className="ar-joined-names">
            {s.players.map((p) => (
              <span key={p.id}>
                <Users />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="ar-display-question">
          <div className="ar-display-meta">
            <span>
              Question {s.index + 1} / {s.quiz.questions.length}
            </span>
            <span>
              <Timer />
              {s.status === "paused"
                ? "PAUSED"
                : `00:${String(seconds).padStart(2, "0")}`}
            </span>
          </div>
          <h1>{q.text}</h1>
          {q.gif && <img src={q.gif} alt="Question illustration" />}
          <div className="ar-display-options">
            {q.options.map((o, i) => (
              <div
                key={i}
                className={
                  s.status === "answer"
                    ? i === q.correctIndex
                      ? "is-correct"
                      : "is-muted"
                    : ""
                }
              >
                <b>{String.fromCharCode(65 + i)}</b>
                <span>{o}</span>
                {s.status === "answer" && i === q.correctIndex && <Check />}
              </div>
            ))}
          </div>
          {s.status === "answer" && q.explanation && (
            <p className="ar-display-explanation">{q.explanation}</p>
          )}
          <p>
            {s.players.filter((p) => p.answers[q.id] !== undefined).length} /{" "}
            {s.players.length} answers received
          </p>
        </div>
      )}
      <footer>
        <Link to="/admin/game">Host controls</Link>
        <span>{s.quiz.title}</span>
      </footer>
    </Surface>
  );
}
