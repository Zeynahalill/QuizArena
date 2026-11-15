import { useState } from "react";
import { Link } from "react-router";
import {
  Radio,
  Users,
  List,
  Timer,
  Play,
  Pause,
  SkipForward,
  CircleCheck,
  Trash2,
  Flag,
  Trophy,
  Monitor,
  Link2,
  Zap,
  Check,
  Plus,
  RotateCcw,
} from "lucide-react";
import { AdminShell, CopyButton, Heading, Podium } from "./ArenaShared";
import { arena, ranking, useArena, useRemaining } from "./arenaStore";
import QR from "./QR";
export default function GameManagement() {
  const s = useArena(),
    seconds = useRemaining();
  const [selected, setSelected] = useState("");
  const [confirm, setConfirm] = useState<"finish" | "reset" | null>(null);
  const ranked = ranking(s.players);
  const mainLink = new URL(`${import.meta.env.BASE_URL}main`, location.origin)
    .href;
  const q = s.quiz.questions[s.index];
  const answered = s.players.filter(
    (p) => p.answers[q.id] !== undefined,
  ).length;
  return (
    <AdminShell>
      <Heading
        icon={<Radio />}
        title="Live Game Management"
        description="Control your active competition in real-time."
      >
        <span className={`ar-status ar-status-${s.status}`}>
          <i />
          {s.status === "question"
            ? "Game In Progress"
            : s.status === "answer"
              ? "Answers Revealed"
              : s.status === "paused"
                ? "Game Paused"
                : s.status === "finished"
                  ? "Game Finished"
                  : "Waiting for Players"}
        </span>
        <span className="ar-clock">
          <Timer />
          00:{String(seconds).padStart(2, "0")}
        </span>
      </Heading>
      <div className="ar-stats">
        <article className="ar-card ar-pin-stat">
          <div>
            <span>Game PIN</span>
            <strong>{s.pin}</strong>
          </div>
          <CopyButton value={s.pin} label="Copy" />
        </article>
        <article className="ar-card">
          <Users />
          <div>
            <span>Participants</span>
            <strong>{s.players.length} / 100</strong>
          </div>
        </article>
        <article className="ar-card">
          <List />
          <div>
            <span>Current Question</span>
            <strong>
              {s.status === "waiting" ? 0 : s.index + 1} /{" "}
              {s.quiz.questions.length}
            </strong>
          </div>
        </article>
        <article className="ar-card">
          <Timer />
          <div>
            <span>Time Left</span>
            <strong>00:00:{String(seconds).padStart(2, "0")}</strong>
          </div>
        </article>
      </div>
      <div className="ar-management-grid">
        <section className="ar-card ar-players">
          <h2>
            <Users />
            Participants<span>{s.players.length}</span>
          </h2>
          <div className="ar-player-list">
            {s.players.length ? (
              s.players.map((p) => (
                <button
                  key={p.id}
                  className={selected === p.id ? "is-selected" : ""}
                  onClick={() => setSelected(selected === p.id ? "" : p.id)}
                  aria-pressed={selected === p.id}
                >
                  <i />
                  <span>
                    {p.name}
                    {p.demo && <small>Demo player</small>}
                  </span>
                  <b className={p.answers[q.id] !== undefined ? "ar-sent" : ""}>
                    {p.answers[q.id] !== undefined
                      ? "Answer Sent"
                      : "Connected"}
                  </b>
                </button>
              ))
            ) : (
              <div className="ar-empty">
                <Users />
                <p>Your players will appear here.</p>
                <Link to="/join" target="_blank" className="ar-text-link">
                  Open the join page ↗
                </Link>
              </div>
            )}
          </div>
          <button
            className="ar-text-link"
            onClick={() => arena.addDemoPlayers()}
            disabled={s.players.length >= 100}
          >
            <Plus />
            Add demo players
          </button>
        </section>
        <section className="ar-card ar-controls">
          <h2>
            <Zap />
            Game Controls
          </h2>
          <div className="ar-control-grid">
            <button
              className="ar-control ar-control-primary"
              disabled={s.status !== "waiting"}
              onClick={() => arena.start()}
            >
              <Play fill="currentColor" />
              Start Competition
            </button>
            <button
              className="ar-control"
              disabled={s.status !== "question"}
              onClick={() => arena.pause()}
            >
              <Pause fill="currentColor" />
              Pause Game
            </button>
            <button
              className="ar-control"
              disabled={s.status !== "paused"}
              onClick={() => arena.resume()}
            >
              <Play fill="currentColor" />
              Resume Game
            </button>
            <button
              className="ar-control ar-control-purple"
              disabled={!["question", "paused"].includes(s.status)}
              onClick={() => arena.endQuestion()}
            >
              <CircleCheck />
              End Question
            </button>
            <button
              className="ar-control"
              disabled={s.status !== "answer"}
              onClick={() => arena.next()}
            >
              <SkipForward fill="currentColor" />
              {s.index === s.quiz.questions.length - 1
                ? "Show Results"
                : "Next Question"}
            </button>
            <button
              className="ar-control ar-control-danger"
              disabled={!selected}
              onClick={() => {
                arena.remove(selected);
                setSelected("");
              }}
            >
              <Trash2 />
              Remove Participant
            </button>
          </div>
          <button
            className="ar-finish"
            disabled={s.status === "finished" || s.status === "waiting"}
            onClick={() => setConfirm("finish")}
          >
            <Flag fill="currentColor" />
            Finish Game
          </button>
          <div className="ar-controls-foot">
            <button
              className="ar-text-link"
              onClick={() => arena.simulateAnswers()}
              disabled={
                s.status !== "question" || !s.players.some((p) => p.demo)
              }
            >
              Simulate demo answers
            </button>
            <span>
              {answered}/{s.players.length} answered
            </span>
          </div>
          {s.status === "finished" && (
            <button
              className="ar-button ar-full"
              onClick={() => setConfirm("reset")}
            >
              <RotateCcw />
              Open New Lobby
            </button>
          )}
        </section>
        <section className="ar-card ar-live-ranking">
          <h2>
            <Trophy />
            Live Leaderboard<span>▥</span>
          </h2>
          <Podium players={s.players} compact />
          <div className="ar-rank-list">
            {ranked.slice(3, 6).map((p, i) => (
              <div key={p.id}>
                <span>{i + 4}</span>
                <b>{p.name}</b>
                <small>{p.score.toLocaleString()} pts</small>
              </div>
            ))}
          </div>
          <Link to="/results" className="ar-text-link">
            View full leaderboard →
          </Link>
        </section>
        <section className="ar-card ar-main-connection">
          <div>
            <h2>
              <Monitor />
              Main Screen Connection
            </h2>
            <div className="ar-copy-row">
              <Link2 />
              <input
                value={mainLink}
                readOnly
                aria-label="Main screen link"
                onFocus={(e) => e.target.select()}
              />
              <CopyButton value={mainLink} />
            </div>
          </div>
          <Link
            to="/main"
            target="_blank"
            aria-label="Open main screen in a new tab"
          >
            <QR value={mainLink} />
          </Link>
          <p>
            Open the display
            <br />
            in another tab
          </p>
        </section>
        <section className="ar-card ar-health">
          <div>
            <Check />
          </div>
          <span>
            <b>Local demo is ready!</b>
            <p>Host and player tabs share this browser’s game state.</p>
          </span>
        </section>
      </div>
      {confirm && (
        <div className="ar-modal-backdrop">
          <section
            className="ar-card ar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title">
              {confirm === "finish" ? "Finish this game?" : "Open a new lobby?"}
            </h2>
            <p>
              {confirm === "finish"
                ? "The current scores will become the final results."
                : "Scores and answers will reset. Your quiz and player list will be kept."}
            </p>
            <div className="ar-modal-actions">
              <button
                className="ar-button ar-button-ghost"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="ar-button"
                onClick={() => {
                  confirm === "finish" ? arena.finish() : arena.reset();
                  setConfirm(null);
                }}
              >
                Confirm
              </button>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
