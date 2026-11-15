import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Gamepad2,
  Home,
  PencilLine,
  Trophy,
  Settings,
  X,
  Crown,
  Star,
} from "lucide-react";
import type { Player } from "./arenaStore";
import { ranking } from "./arenaStore";
import "./arena.css";

export function Logo() {
  const id = useId();
  return (
    <Link to="/" className="ar-logo" aria-label="QuizArena home">
      <svg viewBox="0 0 60 64" aria-hidden="true">
        <defs>
          <linearGradient id={id} x2="1" y2="1">
            <stop stopColor="#09e7ff" />
            <stop offset=".5" stopColor="#7651ff" />
            <stop offset="1" stopColor="#ba48ff" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${id})`}
          fillRule="evenodd"
          d="M31 2 39 23 58 30 38 39 29 62 22 41 2 34 22 24ZM30 25 27 31 22 33 28 35 30 41 33 34 38 32 32 30Z"
        />
      </svg>
      <b>
        Quiz<span>Arena</span>
      </b>
    </Link>
  );
}
export function Waves() {
  const id = useId();
  return (
    <svg
      className="ar-waves"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8f1cff" />
          <stop offset=".45" stopColor="#3919b1" />
          <stop offset="1" stopColor="#07103c" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="1" y1="1" x2="0" y2="0">
          <stop stopColor="#00bfff" />
          <stop offset=".5" stopColor="#064fd1" />
          <stop offset="1" stopColor="#07113c" />
        </linearGradient>
      </defs>
      <path
        d="M0 0H380Q270 160 0 125Z"
        fill={`url(#${id}a)`}
        opacity=".4"
        stroke="#5026c8"
      />
      <path d="M0 0H145L0 151Z" fill={`url(#${id}a)`} />
      <path
        d="M500 0H870Q800 132 688 145 780 80 783 0Z"
        fill={`url(#${id}b)`}
        opacity=".2"
      />
      <path
        d="M0 190Q153 260 132 403 102 350 0 300Z"
        fill={`url(#${id}a)`}
        opacity=".3"
      />
      <path
        d="M0 630Q151 596 223 767L336 900H0Z"
        fill={`url(#${id}a)`}
        opacity=".7"
        stroke="#4b2bb7"
      />
      <path
        d="M0 739Q164 730 258 900H0Z"
        fill={`url(#${id}a)`}
        stroke="#ab58ff"
      />
      <path d="M0 791Q129 761 176 900H0Z" fill="#4914bf" opacity=".4" />
      <path
        d="M1600 516Q1491 505 1438 657 1363 810 1130 900H1600Z"
        fill={`url(#${id}b)`}
        opacity=".5"
      />
      <path
        d="M1600 663Q1472 683 1424 790 1386 848 1300 900H1600Z"
        fill={`url(#${id}b)`}
        stroke="#1996ff"
      />
      <path
        d="M1600 740Q1500 712 1421 900H1600Z"
        fill="#021b71"
        opacity=".75"
      />
      <path d="M1600 0H1360Q1400 167 1600 209Z" fill="#102771" opacity=".18" />
    </svg>
  );
}
export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`arena ar-surface ${className}`}>
      <Waves />
      {children}
    </div>
  );
}
export function DemoNote() {
  return (
    <span className="ar-demo">
      <i /> Local demo · same browser
    </span>
  );
}
export function AdminShell({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(false);
  return (
    <Surface className="ar-admin">
      <aside className="ar-sidebar">
        <Logo />
        <nav aria-label="Admin navigation">
          {[
            ["/admin", "Dashboard", Home],
            ["/admin/quizzes", "Quiz Preparation", PencilLine],
            ["/admin/game", "Game Management", Gamepad2],
            ["/results", "Leaderboard", Trophy],
          ].map(([path, label, Icon]) => {
            const I = Icon as typeof Home;
            return (
              <NavLink key={String(path)} to={String(path)} end>
                <I />
                {String(label)}
              </NavLink>
            );
          })}
          <button onClick={() => setSettings(true)}>
            <Settings />
            Settings
          </button>
        </nav>
        <div className="ar-sidebar-bottom">
          <span>✦</span>
          <b>Create. Play. Enjoy!</b>
          <i />
        </div>
      </aside>
      <div className="ar-admin-content">
        <header className="ar-topbar">
          <Link to="/admin">
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <div>
            <DemoNote />
            <span className="ar-admin-avatar">A</span>
            <span>Admin</span>
          </div>
        </header>
        {children}
      </div>
      {settings && (
        <div className="ar-modal-backdrop" onClick={() => setSettings(false)}>
          <section
            className="ar-card ar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Demo settings"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ar-modal-close"
              aria-label="Close settings"
              onClick={() => setSettings(false)}
            >
              <X />
            </button>
            <h2>Demo settings</h2>
            <p>
              This frontend demo saves quizzes and game state in this browser.
              Open the host and player pages in separate tabs to try the flow.
            </p>
            <p>
              Online multiplayer and admin authentication require the backend.
              The existing login screen is available below.
            </p>
            <Link className="ar-button" to="/admin/login">
              Open admin login
            </Link>
          </section>
        </div>
      )}
    </Surface>
  );
}
export function Heading({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="ar-heading">
      <div className="ar-heading-icon">{icon}</div>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="ar-heading-actions">{children}</div>
    </div>
  );
}
export function CopyButton({
  value,
  label = "Copy Link",
}: {
  value: string;
  label?: string;
}) {
  const [message, setMessage] = useState("");
  return (
    <button
      className="ar-button ar-button-small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setMessage("Copied!");
        } catch {
          setMessage("Select and copy the link below");
        }
        window.setTimeout(() => setMessage(""), 2500);
      }}
    >
      {message === "Copied!" ? <Check /> : <Copy />}
      {message || label}
    </button>
  );
}
export function TrophyArt() {
  const id = useId();
  return (
    <svg
      className="ar-trophy-art"
      viewBox="0 0 620 450"
      aria-label="Golden competition trophy"
      role="img"
    >
      <defs>
        <radialGradient id={`${id}glow`}>
          <stop stopColor="#a75cff" stopOpacity=".65" />
          <stop offset="1" stopColor="#453cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}gold`}>
          <stop stopColor="#9f4b08" />
          <stop offset=".16" stopColor="#fff2ac" />
          <stop offset=".37" stopColor="#ffd44a" />
          <stop offset=".72" stopColor="#d97d0b" />
          <stop offset=".9" stopColor="#fff4bc" />
          <stop offset="1" stopColor="#af5810" />
        </linearGradient>
        <linearGradient id={`${id}cup`} x2=".7" y2="1">
          <stop stopColor="#fff5b8" />
          <stop offset=".32" stopColor="#ffdc58" />
          <stop offset=".65" stopColor="#f4a51c" />
          <stop offset="1" stopColor="#ac5006" />
        </linearGradient>
        <linearGradient id={`${id}base`} x2=".8" y2="1">
          <stop stopColor="#4b32a6" />
          <stop offset=".55" stopColor="#0b123e" />
          <stop offset="1" stopColor="#1053b6" />
        </linearGradient>
      </defs>
      <ellipse cx="319" cy="248" rx="285" ry="200" fill={`url(#${id}glow)`} />
      <g fill="none" strokeLinecap="round">
        <ellipse
          className="ar-orbit"
          cx="312"
          cy="297"
          rx="259"
          ry="53"
          transform="rotate(-17 312 297)"
          stroke="#6a50ff"
          strokeWidth="9"
          opacity=".4"
        />
        <ellipse
          cx="312"
          cy="297"
          rx="259"
          ry="53"
          transform="rotate(-17 312 297)"
          stroke="#c5b0ff"
          strokeWidth="2"
        />
        <ellipse
          cx="312"
          cy="382"
          rx="237"
          ry="24"
          stroke="#398aff"
          strokeWidth="2"
        />
      </g>
      <g className="ar-trophy-float">
        <path
          d="M251 109C145 60 193 228 274 217M372 109C478 60 430 228 349 217"
          fill="none"
          stroke="#a85415"
          strokeWidth="23"
        />
        <path
          d="M251 106C145 60 193 220 274 214M372 106C478 60 430 220 349 214"
          fill="none"
          stroke={`url(#${id}gold)`}
          strokeWidth="16"
        />
        <path
          d="M233 80H389L376 180Q368 238 321 255H301Q254 238 246 180Z"
          fill={`url(#${id}cup)`}
          stroke="#ffe6a1"
          strokeWidth="3"
        />
        <path
          d="M248 94 259 172Q261 189 267 200"
          fill="none"
          stroke="#fff8cf"
          strokeWidth="8"
          opacity=".6"
        />
        <ellipse
          cx="311"
          cy="80"
          rx="78"
          ry="13"
          fill={`url(#${id}gold)`}
          stroke="#ffeeb3"
          strokeWidth="3"
        />
        <ellipse cx="311" cy="79" rx="67" ry="7" fill="#c57d20" />
        <path
          d="m311 117 13 29 33 3-25 23 7 33-28-16-28 16 7-33-25-23 33-3Z"
          fill="#ffdf67"
          stroke="#ce8017"
          strokeWidth="3"
        />
        <path
          d="M300 253H322V294L348 310H274L300 294Z"
          fill={`url(#${id}gold)`}
        />
        <ellipse cx="311" cy="254" rx="18" ry="8" fill={`url(#${id}gold)`} />
        <rect
          x="267"
          y="307"
          width="89"
          height="14"
          rx="5"
          fill={`url(#${id}gold)`}
        />
        <path
          d="M254 324H369L383 365H240Z"
          fill={`url(#${id}base)`}
          stroke="#bba3ed"
          strokeWidth="2"
        />
        <rect
          x="286"
          y="337"
          width="51"
          height="15"
          rx="1"
          fill={`url(#${id}gold)`}
        />
        <path
          d="M228 367H394L429 398H193Z"
          fill={`url(#${id}base)`}
          stroke="#3a63d0"
        />
      </g>
      <g fill="#7160ef" fontFamily="Arial" fontWeight="bold">
        <text x="69" y="135" fontSize="96" transform="rotate(-18 69 135)">
          ?
        </text>
        <text x="492" y="293" fontSize="87" transform="rotate(17 492 293)">
          ?
        </text>
        <text
          x="95"
          y="300"
          fontSize="74"
          fill="#9452ff"
          transform="rotate(-20 95 300)"
        >
          ?
        </text>
        <text
          x="511"
          y="137"
          fontSize="68"
          fill="#26b7ff"
          transform="rotate(20 511 137)"
        >
          ?
        </text>
      </g>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <text
          key={i}
          x={40 + ((i * 79) % 550)}
          y={30 + ((i * 53) % 350)}
          fill={i % 2 ? "#27bbff" : "#9368ff"}
          fontSize={i % 3 ? 16 : 24}
        >
          ✦
        </text>
      ))}
    </svg>
  );
}
export function Hourglass() {
  return (
    <div className="ar-hourglass" aria-hidden="true">
      <div className="ar-hourglass-orbit" />
      <svg viewBox="0 0 180 200">
        <defs>
          <linearGradient id="hourglass-gold">
            <stop stopColor="#ad6416" />
            <stop offset=".3" stopColor="#fff5b7" />
            <stop offset=".6" stopColor="#ffc53c" />
            <stop offset="1" stopColor="#bb711d" />
          </linearGradient>
        </defs>
        <path
          d="M47 29H133Q135 76 97 98Q135 123 133 172H47Q45 123 83 98Q45 76 47 29Z"
          fill="#c8c8ff44"
          stroke="#e9d5ff"
          strokeWidth="3"
        />
        <path
          d="M55 62Q90 83 125 62Q119 86 90 102Q61 86 55 62M55 167Q61 151 90 129Q119 151 125 167Z"
          fill="#ffcd43"
        />
        <path d="M90 100V133" stroke="#ffd86e" strokeWidth="3" />
        <rect
          x="35"
          y="16"
          width="110"
          height="17"
          rx="8"
          fill="url(#hourglass-gold)"
        />
        <rect
          x="35"
          y="169"
          width="110"
          height="17"
          rx="8"
          fill="url(#hourglass-gold)"
        />
        <path
          d="M58 38Q56 63 69 77"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          opacity=".6"
        />
      </svg>
    </div>
  );
}
export function Podium({
  players,
  compact = false,
}: {
  players: Player[];
  compact?: boolean;
}) {
  const leaders = ranking(players).slice(0, 3);
  if (!leaders.length)
    return (
      <div className="ar-empty">
        <Trophy />
        <p>The podium is waiting.</p>
        <span>Players will appear after joining the game.</span>
      </div>
    );
  return (
    <div className={`ar-podium ${compact ? "ar-podium-compact" : ""}`}>
      {[1, 0, 2].map((i) =>
        leaders[i] ? (
          <div
            className={`ar-podium-place ar-place-${i + 1}`}
            key={leaders[i].id}
          >
            {i === 0 && <Crown className="ar-crown" />}
            <span className="ar-medal">{i + 1}</span>
            <div>
              <b>{leaders[i].name}</b>
              <strong>
                <Star />
                {leaders[i].score.toLocaleString()} <small>pts</small>
              </strong>
            </div>
          </div>
        ) : (
          <div key={i} />
        ),
      )}
    </div>
  );
}
export function ErrorText({ message }: { message: string }) {
  return message ? (
    <p className="ar-error" role="alert">
      {message}
    </p>
  ) : null;
}
