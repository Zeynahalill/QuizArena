import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Check,
  Home,
  Maximize,
  Pause,
  Play,
  Star,
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
export function Results() {
  const s = useArena();
  const sample = !s.players.length;
  const players = ranking(sample ? SAMPLE_PLAYERS : s.players);
  const finished = s.status === "finished" || sample;
  return (
    <Surface className="ar-results">
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
        {sample && <small>Design preview · sample results</small>}
      </div>
      <div className="ar-results-content">
        <Podium players={players} />
        <div className="ar-final-list">
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
      </div>
      <Link to="/" className="ar-button ar-home-button">
        <Home fill="currentColor" />
        Back to Home
      </Link>
      {!sample && (
        <Link to="/admin/game" className="ar-text-link ar-results-manage">
          Back to Game Management
        </Link>
      )}
      <div className="ar-result-confetti" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${4 + ((i * 43) % 92)}%`,
              top: `${15 + ((i * 23) % 75)}%`,
              background: ["#8031ff", "#1f9dff", "#ffc43b", "#00c8da"][i % 4],
              rotate: `${i * 43}deg`,
            }}
          />
        ))}
      </div>
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
