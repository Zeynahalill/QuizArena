import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Monitor,
  Timer,
  UserRound,
  Users,
  Wifi,
} from "lucide-react";
import { DemoNote, ErrorText, Hourglass, Logo, Surface } from "./ArenaShared";
import { arena, PLAYER_KEY, useArena } from "./arenaStore";
import QR from "./QR";
function JoinFrame({ children }: { children: React.ReactNode }) {
  return (
    <Surface className="ar-join-page">
      <section className="ar-join-panel">
        <header>
          <Logo />
          <DemoNote />
        </header>
        {children}
      </section>
    </Surface>
  );
}
export function JoinGame() {
  const game = useArena();
  const [params] = useSearchParams();
  const [pin, setPin] = useState(
    params.get("pin")?.replace(/\D/g, "").slice(0, 4) || "",
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const joinURL = new URL(
    `${import.meta.env.BASE_URL}join?pin=${game.pin}`,
    location.origin,
  ).href;
  return (
    <JoinFrame>
      <h1>Join the Game!</h1>
      <p className="ar-join-subtitle">Scan the QR code or enter the PIN</p>
      <div className="ar-pin-layout">
        <div className="ar-qr-panel">
          <div>
            <QR value={joinURL} />
          </div>
          <span>
            Game PIN <b>{game.pin}</b>
          </span>
          <small>Use another tab in this browser for the local demo.</small>
        </div>
        <div className="ar-or-divider">
          <span>OR</span>
        </div>
        <form
          className="ar-pin-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin !== game.pin) {
              setError("Incorrect PIN. Use the PIN shown by the host.");
              return;
            }
            if (game.status !== "waiting") {
              setError(
                "The game has already started. Ask the host to open a new lobby.",
              );
              return;
            }
            navigate(`/join/name?pin=${pin}`);
          }}
        >
          <label htmlFor="ar-pin">Enter PIN</label>
          <input
            id="ar-pin"
            className="ar-pin-input"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
              setError("");
            }}
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            autoComplete="off"
            placeholder="• • • •"
            required
            aria-describedby="ar-pin-help"
          />
          <span id="ar-pin-help" className="ar-fineprint">
            4-digit game PIN
          </span>
          <ErrorText message={error} />
          <button className="ar-button" disabled={pin.length !== 4}>
            Continue
            <ArrowRight />
          </button>
        </form>
      </div>
      <Link to="/" className="ar-back-link">
        <ArrowLeft />
        Back to Home
      </Link>
    </JoinFrame>
  );
}
export function EnterName() {
  const [params] = useSearchParams();
  const pin = params.get("pin") || "";
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  return (
    <JoinFrame>
      <Link to="/join" className="ar-round-back" aria-label="Back to enter PIN">
        <ArrowLeft />
      </Link>
      <div className="ar-player-orb">
        <UserRound fill="currentColor" />
      </div>
      <h1>Enter Your Name</h1>
      <p className="ar-join-subtitle">Let us know who you are!</p>
      <form
        className="ar-name-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            arena.join(name, pin);
            navigate("/lobby");
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Could not join the game.",
            );
          }
        }}
      >
        <label className="ar-name-input">
          <UserRound fill="currentColor" />
          <input
            aria-label="Your name"
            placeholder="Your Name…"
            value={name}
            maxLength={30}
            autoComplete="nickname"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <ErrorText message={error} />
        <button className="ar-button" disabled={!name.trim()}>
          Join Game
          <ArrowRight />
        </button>
      </form>
      <div className="ar-floating-spark ar-floating-spark-1">✦</div>
      <div className="ar-floating-spark ar-floating-spark-2">✦</div>
    </JoinFrame>
  );
}
export function Lobby() {
  const s = useArena();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const id = sessionStorage.getItem(PLAYER_KEY);
  const player = s.players.find((p) => p.id === id);
  useEffect(() => {
    if (!player) {
      navigate("/join", { replace: true });
      return;
    }
    if (s.status === "finished") navigate("/results", { replace: true });
    else if (s.status !== "waiting") navigate("/play/live", { replace: true });
  }, [s.status, player, navigate]);
  useEffect(() => {
    const started = Date.now();
    const t = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <JoinFrame>
      <span className="ar-connection">
        <Wifi />
        Connected as {player?.name}
      </span>
      <Hourglass />
      <h1>Waiting for the Game to Start…</h1>
      <p className="ar-join-subtitle">Get ready! The quiz will begin soon.</p>
      <div className="ar-lobby-stats">
        <div>
          <Users />
          <span>
            Participants<strong>{s.players.length} / 100</strong>
          </span>
        </div>
        <i />
        <div>
          <Timer />
          <span>
            Time
            <strong>
              {String(Math.floor(elapsed / 3600)).padStart(2, "0")}:
              {String(Math.floor(elapsed / 60) % 60).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </strong>
          </span>
        </div>
      </div>
      <div className="ar-lobby-bottom">
        <Link to="/admin/game" target="_blank" className="ar-text-link">
          <Monitor />
          Open host controls in another tab ↗
        </Link>
        <button
          className="ar-text-link"
          onClick={() => {
            if (id) arena.remove(id);
            sessionStorage.removeItem(PLAYER_KEY);
            navigate("/join");
          }}
        >
          Leave game
        </button>
      </div>
    </JoinFrame>
  );
}
