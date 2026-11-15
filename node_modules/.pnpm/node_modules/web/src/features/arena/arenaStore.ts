import { useEffect, useState, useSyncExternalStore } from "react";

export type QuizQuestion = {
  id: string;
  text: string;
  highlight: string;
  gif: string;
  options: string[];
  correctIndex: number;
  seconds: number;
  explanation: string;
};
export type Quiz = {
  title: string;
  questions: QuizQuestion[];
  correctGif: string;
  incorrectGif: string;
};
export type Player = {
  id: string;
  name: string;
  score: number;
  answers: Record<string, number>;
  demo?: boolean;
};
type ArenaState = {
  version: 1;
  quiz: Quiz;
  pin: string;
  players: Player[];
  status: "waiting" | "question" | "paused" | "answer" | "finished";
  index: number;
  deadline: number;
  remaining: number;
  round: number;
};
const KEY = "quizarena-local-demo-v1";
export const PLAYER_KEY = "quizarena-player-id";
export const asset = (name: string, still = false) =>
  `${import.meta.env.BASE_URL}gifs/section-2/${name}.${still ? "png" : "gif"}`;
export const defaultQuiz: Quiz = {
  title: "Gazebo & ROS Challenge",
  correctGif: asset("correct"),
  incorrectGif: asset("incorrect"),
  questions: [
    {
      id: "ros",
      text: "What is ROS?",
      highlight: "ROS",
      gif: asset("ros"),
      options: [
        "Robot Operating System",
        "Robotic Operating System",
        "Real Open Source",
        "Robot OS",
      ],
      correctIndex: 0,
      seconds: 20,
      explanation: "ROS stands for Robot Operating System.",
    },
    {
      id: "launch",
      text: "Which command starts a ROS launch file?",
      highlight: "launch file",
      gif: asset("launch"),
      options: ["rosrun", "roslaunch", "rostopic", "rosnode"],
      correctIndex: 1,
      seconds: 20,
      explanation: "In ROS 1, roslaunch starts nodes defined in a launch file.",
    },
    {
      id: "gazebo",
      text: "What is Gazebo used for?",
      highlight: "Gazebo",
      gif: asset("gazebo"),
      options: [
        "Robot simulation",
        "Video editing",
        "Database storage",
        "Web hosting",
      ],
      correctIndex: 0,
      seconds: 20,
      explanation: "Gazebo is used to simulate robots and their environments.",
    },
  ],
};
const newState = (): ArenaState => ({
  version: 1,
  quiz: structuredClone(defaultQuiz),
  pin: "4827",
  players: [],
  status: "waiting",
  index: 0,
  deadline: 0,
  remaining: 20,
  round: 1,
});
function read(): ArenaState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      s?.version === 1 &&
      Array.isArray(s.quiz?.questions) &&
      s.quiz.questions.length &&
      Array.isArray(s.players)
    )
      return s;
  } catch {
    /* Start safely when storage is unavailable or invalid. */
  }
  return newState();
}
let state = read();
const listeners = new Set<() => void>();
let storageMessage = "";
function emit() {
  listeners.forEach((fn) => fn());
}
function update(fn: (s: ArenaState) => ArenaState) {
  const previous = state;
  state = fn(state);
  if (state === previous) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageMessage = "";
  } catch {
    storageMessage =
      "Changes are available in this tab only. Browser storage is full or unavailable.";
  }
  emit();
}
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    state = read();
    emit();
  }
});
export function useArena() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
}
export function storageWarning() {
  return storageMessage;
}
export function useRemaining() {
  const game = useArena();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);
  const seconds =
    game.status === "question"
      ? Math.max(0, Math.ceil((game.deadline - now) / 1000))
      : game.remaining;
  useEffect(() => {
    if (game.status === "question" && game.deadline <= Date.now())
      arena.endQuestion();
  }, [game.status, game.deadline, now]);
  return seconds;
}
export const arena = {
  saveQuiz(quiz: Quiz) {
    if (
      !quiz.title.trim() ||
      !quiz.questions.length ||
      quiz.questions.some(
        (q) =>
          !q.text.trim() ||
          q.options.length < 2 ||
          q.options.some((o) => !o.trim()) ||
          q.correctIndex < 0 ||
          q.correctIndex >= q.options.length,
      )
    )
      throw new Error(
        "Complete every question and answer, and choose one correct answer.",
      );
    if (state.status !== "waiting" && state.status !== "finished")
      throw new Error("Finish the active game before editing the quiz.");
    update((s) => ({
      ...s,
      quiz: structuredClone(quiz),
      index: 0,
      status: "waiting",
    }));
    if (storageMessage) throw new Error(storageMessage);
  },
  join(name: string, pin: string) {
    if (pin !== state.pin)
      throw new Error("This PIN does not match the local demo room.");
    if (state.status !== "waiting")
      throw new Error(
        "This game has already started. Ask the host to open a new lobby.",
      );
    if (state.players.length >= 100) throw new Error("This room is full.");
    if (!name.trim()) throw new Error("Please enter your name.");
    const id = crypto.randomUUID();
    update((s) => ({
      ...s,
      players: [
        ...s.players,
        { id, name: name.trim().slice(0, 30), score: 0, answers: {} },
      ],
    }));
    sessionStorage.setItem(PLAYER_KEY, id);
    return id;
  },
  remove(id: string) {
    update((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }));
  },
  addDemoPlayers() {
    update((s) => ({
      ...s,
      players: [
        ...s.players,
        ...[
          "Sara Ahmed",
          "Omar Khaled",
          "Lina Hassan",
          "Yusuf Ali",
          "Tala Mustafa",
          "Adam Khaled",
        ]
          .filter((name) => !s.players.some((p) => p.demo && p.name === name))
          .slice(0, Math.max(0, 100 - s.players.length))
          .map((name, i) => ({
            id: `demo-${i}-${Date.now()}`,
            name,
            score: 0,
            answers: {},
            demo: true,
          })),
      ],
    }));
  },
  start() {
    if (state.status !== "waiting") return;
    update((s) => ({
      ...s,
      status: "question",
      index: 0,
      deadline: Date.now() + s.quiz.questions[0].seconds * 1000,
      remaining: s.quiz.questions[0].seconds,
      players: s.players.map((p) => ({ ...p, score: 0, answers: {} })),
    }));
  },
  pause() {
    if (state.status !== "question") return;
    update((s) => ({
      ...s,
      status: "paused",
      remaining: Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)),
    }));
  },
  resume() {
    if (state.status !== "paused") return;
    update((s) => ({
      ...s,
      status: "question",
      deadline: Date.now() + s.remaining * 1000,
    }));
  },
  endQuestion() {
    if (state.status !== "question" && state.status !== "paused") return;
    update((s) => ({ ...s, status: "answer", remaining: 0 }));
  },
  next() {
    if (state.status !== "answer") return;
    if (state.index === state.quiz.questions.length - 1) {
      arena.finish();
      return;
    }
    update((s) => ({
      ...s,
      index: s.index + 1,
      status: "question",
      remaining: s.quiz.questions[s.index + 1].seconds,
      deadline: Date.now() + s.quiz.questions[s.index + 1].seconds * 1000,
    }));
  },
  finish() {
    update((s) => ({ ...s, status: "finished", remaining: 0 }));
  },
  reset() {
    update((s) => ({
      ...s,
      status: "waiting",
      index: 0,
      deadline: 0,
      remaining: s.quiz.questions[0].seconds,
      round: s.round + 1,
      players: s.players.map((p) => ({ ...p, score: 0, answers: {} })),
    }));
  },
  answer(id: string, choice: number) {
    const q = state.quiz.questions[state.index];
    if (
      state.status !== "question" ||
      Date.now() >= state.deadline ||
      choice < 0 ||
      choice >= q.options.length
    )
      return;
    update((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id !== id || p.answers[q.id] !== undefined
          ? p
          : {
              ...p,
              score: p.score + (choice === q.correctIndex ? 100 : 0),
              answers: { ...p.answers, [q.id]: choice },
            },
      ),
    }));
  },
  simulateAnswers() {
    state.players
      .filter((p) => p.demo)
      .forEach((p, i) =>
        arena.answer(
          p.id,
          i % 3 === 0
            ? (state.quiz.questions[state.index].correctIndex + 1) %
                state.quiz.questions[state.index].options.length
            : state.quiz.questions[state.index].correctIndex,
        ),
      );
  },
};
export const ranking = (players: Player[]) =>
  [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
