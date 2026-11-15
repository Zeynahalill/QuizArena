import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./QuizPlayPage.css";

// Frontend demo. Replace QUESTIONS with the game server's question payload.
export type Question = {
  id: number | string;
  text: string;
  highlight: string;
  gif: string;
  options: string[];
  correctIndex: number;
};
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is ROS?",
    highlight: "ROS",
    gif: "ros",
    options: [
      "Robot Operating System",
      "Robotic Operating System",
      "Real Open Source",
      "Robot OS",
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    text: "Which command starts a ROS launch file?",
    highlight: "launch file",
    gif: "launch",
    options: ["rosrun", "roslaunch", "rostopic", "rosnode"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "What is Gazebo used for?",
    highlight: "Gazebo",
    gif: "gazebo",
    options: [
      "Robot simulation",
      "Video editing",
      "Database storage",
      "Web hosting",
    ],
    correctIndex: 0,
  },
];
const SECONDS = 20;
const POINTS = 100;
const LETTERS = ["A", "B", "C", "D", "E", "F"];
const mediaUrl = (name: string, still = false) =>
  `${import.meta.env.BASE_URL}gifs/section-2/${name}.${still ? "png" : "gif"}`;

function Brand() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="qp-brand">
      <svg viewBox="0 0 60 64" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#18e6ff" />
            <stop offset=".48" stopColor="#6461ff" />
            <stop offset="1" stopColor="#ac35ff" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${id})`}
          fillRule="evenodd"
          d="M31 2 39 23 58 30 38 39 29 62 22 41 2 34 22 24ZM30 25 27 31 22 33 28 35 30 41 33 34 38 32 32 30Z"
        />
      </svg>
      <span>
        Quiz<span>Arena</span>
      </span>
    </div>
  );
}

// Resolution-independent layered ribbons; deliberately scoped to Section 2.
function Ribbons() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className="qp-ribbons"
      viewBox="0 0 774 858"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#7908ff" />
          <stop offset=".5" stopColor="#4911cb" />
          <stop offset="1" stopColor="#131153" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="1" y1="1" x2="0" y2="0">
          <stop stopColor="var(--ribbon-bright, #008bff)" />
          <stop offset=".48" stopColor="var(--ribbon-mid, #064cce)" />
          <stop offset="1" stopColor="var(--ribbon-dark, #091541)" />
        </linearGradient>
      </defs>
      <path d="M0 25 27 0H118L0 117Z" fill="#25145c" opacity=".32" />
      <path
        d="M460 0H590C560 105 551 146 482 183 527 120 516 91 535 45Z"
        fill={`url(#${id}b)`}
        opacity=".16"
        stroke="#3134bd"
      />
      <path
        d="M774 0V285C714 324 684 368 655 400 740 342 728 338 774 319Z"
        fill={`url(#${id}b)`}
        opacity=".35"
        stroke="#2368e7"
      />
      <path
        d="M0 568C63 535 76 469 91 429 79 523 48 571 0 612Z"
        fill={`url(#${id}v)`}
        opacity=".45"
        stroke="#5350e9"
      />
      <path
        d="M0 728C106 753 79 808 230 858H0Z"
        fill={`url(#${id}v)`}
        opacity=".6"
        stroke="#7438e3"
      />
      <path
        d="M0 781C88 791 83 823 161 858H0Z"
        fill={`url(#${id}v)`}
        stroke="#9e5aff"
      />
      <path d="M0 806C62 813 58 839 104 858H0Z" fill="#6515e9" opacity=".4" />
      <path
        d="M774 666C688 700 671 788 583 811 520 828 480 824 448 858H774Z"
        fill={`url(#${id}b)`}
        opacity=".45"
        stroke="#135cf4"
      />
      <path
        d="M774 717C693 734 688 808 594 858H774Z"
        fill={`url(#${id}b)`}
        stroke="var(--ribbon-edge, #31c8ff)"
      />
      <path
        d="M774 754C704 759 680 822 638 858H774Z"
        fill={`url(#${id}b)`}
        opacity=".7"
      />
      <path
        d="M774 794C731 784 702 829 676 858H774Z"
        fill="#061645"
        opacity=".45"
      />
    </svg>
  );
}

function Panel({
  children,
  kind = "question",
}: {
  children: ReactNode;
  kind?: string;
}) {
  return (
    <section className={`qp-panel qp-panel--${kind}`}>
      <Ribbons />
      <div className="qp-panel-content">{children}</div>
    </section>
  );
}
function Media({ name, label }: { name: string; label: string }) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`qp-media qp-media--${name.includes("/") || name.startsWith("data:") ? "custom" : name}`}
    >
      {failed ? (
        <span className="qp-media-fallback">{label}</span>
      ) : (
        <img
          src={
            name.includes("/") || name.startsWith("data:")
              ? name
              : mediaUrl(name, !!reduced)
          }
          alt={label}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
function Decorations() {
  return (
    <div className="qp-decoration" aria-hidden="true">
      <span className="qp-question-mark qp-question-mark--left">?</span>
      <span className="qp-question-mark qp-question-mark--right">?</span>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={`qp-spark qp-spark--${i}`}>
          ✦
        </i>
      ))}
    </div>
  );
}
export function QuestionScreen({
  question,
  index,
  seconds,
  selected,
  onSelect,
  total = QUESTIONS.length,
  readOnly = false,
}: {
  question: Question;
  index: number;
  seconds: number;
  selected: number | null;
  onSelect: (i: number) => void;
  total?: number;
  readOnly?: boolean;
}) {
  const highlighted =
    question.highlight && question.text.includes(question.highlight);
  const [before, after] = highlighted
    ? question.text.split(question.highlight)
    : [question.text, ""];
  return (
    <Panel>
      <header className="qp-header">
        <Brand />
        <div
          className={`qp-timer ${seconds <= 5 ? "qp-timer--urgent" : ""}`}
          role="timer"
          aria-label={`${seconds} seconds remaining`}
        >
          <Timer />
          <span>00:{String(seconds).padStart(2, "0")}</span>
        </div>
      </header>
      <div className="qp-question-body">
        <Decorations />
        <div className="qp-progress">
          Question {index + 1} / {total}
        </div>
        <h1 className={question.text.length > 25 ? "qp-long-title" : ""}>
          {before}
          {highlighted && <span>{question.highlight}</span>}
          {after}
        </h1>
        {question.gif && (
          <Media key={question.id} name={question.gif} label={question.text} />
        )}
        <div className="qp-options" aria-label="Answer options">
          {question.options.map((answer, i) => (
            <button
              type="button"
              key={`${question.id}-${i}`}
              className={`qp-option ${selected === i ? "is-selected" : ""}`}
              disabled={readOnly || selected !== null}
              aria-pressed={selected === i}
              onClick={() => onSelect(i)}
            >
              <span className="qp-letter">{LETTERS[i]}</span>
              <span>{answer}</span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
function StatusOrb({ correct }: { correct: boolean }) {
  return (
    <div
      className={`qp-orbit ${correct ? "qp-orbit--correct" : "qp-orbit--incorrect"}`}
      aria-hidden="true"
    >
      <div className="qp-orbit-ring" />
      <div className="qp-orbit-rays" />
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          className="qp-confetti"
          style={
            {
              "--i": i,
              "--turn": `${i * 22.5}deg`,
              "--color": correct
                ? ["#00d7ad", "#ffbc36", "#9367ff", "#f953b5"][i % 4]
                : ["#ed3c82", "#9c245e"][i % 2],
            } as CSSProperties
          }
        >
          {correct ? "" : "×"}
        </i>
      ))}
      <div className="qp-status-orb">
        {correct ? <Check strokeWidth={4.5} /> : <X strokeWidth={4.5} />}
      </div>
    </div>
  );
}
export function ResultScreen({
  correct,
  answer,
  timedOut,
  onContinue,
  gif,
  continueLabel = "Continue",
}: {
  correct: boolean;
  answer: string;
  timedOut: boolean;
  onContinue: () => void;
  gif?: string;
  continueLabel?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <Panel kind={correct ? "correct" : "incorrect"}>
      <header className="qp-header">
        <Brand />
        <div className={`qp-points ${correct ? "qp-points--gold" : ""}`}>
          <Trophy />
          <span>{correct ? "+100" : "0"} pts</span>
        </div>
      </header>
      <div className="qp-result-body">
        <StatusOrb correct={correct} />
        <div className="qp-result-detail">
          <h1 ref={heading} tabIndex={-1} className="qp-verdict">
            <span>{correct ? <Check /> : <X />}</span>
            {correct ? "Correct!" : timedOut ? "Time’s up!" : "Incorrect!"}
          </h1>
          <p>The correct answer is:</p>
          <div className="qp-answer">{answer}</div>
          <Media
            name={gif || (correct ? "correct" : "incorrect")}
            label={correct ? "Celebration trophy" : "Rainy cloud"}
          />
          <button type="button" className="qp-continue" onClick={onContinue}>
            {continueLabel} <ArrowRight />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function QuizPlayPage() {
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "result" | "finished">(
    "question",
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const locked = useRef(false);
  const reduced = useReducedMotion();
  const question = QUESTIONS[qIndex];

  useEffect(() => {
    if (phase !== "question" || selected !== null) return;
    const timer = window.setTimeout(() => {
      if (locked.current) return;
      if (seconds <= 1) {
        locked.current = true;
        setSeconds(0);
        setPhase("result");
      } else setSeconds((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, seconds, selected]);
  useEffect(() => {
    if (selected === null || phase !== "question") return;
    const timer = window.setTimeout(() => setPhase("result"), 420);
    return () => window.clearTimeout(timer);
  }, [selected, phase]);

  const select = (i: number) => {
    if (locked.current || phase !== "question") return;
    locked.current = true;
    setSelected(i);
    if (i === question.correctIndex) setScore((s) => s + POINTS);
  };
  const next = () => {
    if (qIndex === QUESTIONS.length - 1) {
      setPhase("finished");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setSeconds(SECONDS);
    locked.current = false;
    setPhase("question");
  };
  const restart = () => {
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setSeconds(SECONDS);
    locked.current = false;
    setPhase("question");
  };

  return (
    <main className="quiz-play">
      <div className="qp-ambient" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.div
          className="qp-stage"
          key={`${qIndex}-${phase}`}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          {phase === "question" ? (
            <QuestionScreen
              question={question}
              index={qIndex}
              seconds={seconds}
              selected={selected}
              onSelect={select}
            />
          ) : phase === "result" ? (
            <ResultScreen
              correct={selected === question.correctIndex}
              timedOut={selected === null}
              answer={`${LETTERS[question.correctIndex]}. ${question.options[question.correctIndex]}`}
              onContinue={next}
            />
          ) : (
            <Panel kind="finished">
              <header className="qp-header">
                <Brand />
                <div className="qp-points qp-points--gold">
                  <Trophy /> Final Results
                </div>
              </header>
              <div className="qp-finished">
                <Trophy className="qp-final-trophy" />
                <h1>Competition Finished!</h1>
                <p>
                  You answered {score / POINTS} of {QUESTIONS.length} questions
                  correctly.
                </p>
                <strong>
                  {score} <span>pts</span>
                </strong>
                <button className="qp-continue" onClick={restart}>
                  <RotateCcw /> Play Again
                </button>
              </div>
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
