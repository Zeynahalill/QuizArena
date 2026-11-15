import { useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  ImagePlus,
  List,
  Monitor,
  PencilLine,
  Plus,
  Save,
  Settings,
  Timer,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AdminShell, ErrorText, Heading, Logo } from "./ArenaShared";
import { arena, asset, storageWarning, useArena } from "./arenaStore";
import type { Quiz, QuizQuestion } from "./arenaStore";
function UploadMedia({
  src,
  label,
  onChange,
}: {
  src: string;
  label: string;
  onChange: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return (
    <div className="ar-upload">
      <img src={src || asset("ros", true)} alt={label} />
      <button
        className="ar-button ar-button-ghost ar-button-small"
        onClick={() => input.current?.click()}
      >
        <Upload />
        {src ? "Change GIF" : "Add GIF"}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/gif,image/png,image/jpeg,image/webp"
        aria-label={label}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setError("");
          if (
            !["image/gif", "image/png", "image/jpeg", "image/webp"].includes(
              f.type,
            ) ||
            f.size > 700000
          ) {
            setError("Choose a GIF, PNG, JPG or WebP smaller than 700 KB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.onerror = () => setError("The file could not be read.");
          reader.readAsDataURL(f);
          e.target.value = "";
        }}
      />
      <ErrorText message={error} />
    </div>
  );
}
function Preview({ question }: { question: QuizQuestion }) {
  return (
    <div className="ar-question-preview">
      <div>
        <Logo />
        <span className="ar-clock">
          <Timer />
          00:{String(question.seconds).padStart(2, "0")}
        </span>
      </div>
      <h3>{question.text || "Your question goes here"}</h3>
      {question.gif && (
        <img className="ar-preview-gif" src={question.gif} alt="Question GIF" />
      )}
      <div className="ar-preview-options">
        {question.options.map((o, i) => (
          <div
            key={i}
            className={i === question.correctIndex ? "is-selected" : ""}
          >
            <b>{String.fromCharCode(65 + i)}</b>
            {o || `Answer ${i + 1}`}
          </div>
        ))}
      </div>
      <span className="ar-preview-star">✦</span>
    </div>
  );
}
export default function QuizEditor() {
  const s = useArena();
  const [draft, setDraft] = useState<Quiz>(() => structuredClone(s.quiz));
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const q = draft.questions[index];
  const locked = !["waiting", "finished"].includes(s.status);
  const edit = (patch: Partial<QuizQuestion>) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((old, i) =>
        i === index ? { ...old, ...patch } : old,
      ),
    }));
    setDirty(true);
    setNotice("");
  };
  const add = () => {
    if (draft.questions.length >= 30) return;
    const question: QuizQuestion = {
      id: crypto.randomUUID(),
      text: "",
      highlight: "",
      gif: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      seconds: 20,
      explanation: "",
    };
    setDraft((d) => ({ ...d, questions: [...d.questions, question] }));
    setIndex(draft.questions.length);
    setDirty(true);
    setNotice("");
  };
  const remove = (i: number) => {
    if (draft.questions.length === 1) return;
    setDraft((d) => ({
      ...d,
      questions: d.questions.filter((_, j) => j !== i),
    }));
    setIndex((old) =>
      Math.max(
        0,
        Math.min(old - (i < old ? 1 : 0), draft.questions.length - 2),
      ),
    );
    setDirty(true);
  };
  const save = () => {
    setError("");
    try {
      arena.saveQuiz(draft);
      setDirty(false);
      setNotice("Quiz saved successfully. Your next game is ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the quiz.");
    }
  };
  return (
    <AdminShell>
      <Heading
        icon={<PencilLine />}
        title="Quiz Editor"
        description="Create and customize your quiz"
      >
        <button
          className="ar-button ar-button-ghost"
          onClick={() => setPreview(true)}
        >
          <Eye />
          Preview
        </button>
        <button className="ar-button" onClick={save} disabled={locked}>
          <Save />
          Save Quiz{dirty ? " •" : ""}
        </button>
      </Heading>
      {locked && (
        <div className="ar-notice">
          The game is active. Finish it before saving changes.
        </div>
      )}
      <ErrorText message={error} />
      {notice && (
        <p className="ar-notice" role="status">
          <Check />
          {notice}
        </p>
      )}
      <div className="ar-editor-grid">
        <aside className="ar-card ar-question-list">
          <h2>
            <List />
            Questions ({draft.questions.length})
          </h2>
          <button
            className="ar-button ar-full"
            onClick={add}
            disabled={draft.questions.length >= 30}
          >
            <Plus />
            Add Question
          </button>
          <div>
            {draft.questions.map((question, i) => (
              <div
                key={question.id}
                className={`ar-question-row ${i === index ? "is-selected" : ""}`}
              >
                <button onClick={() => setIndex(i)}>
                  <b>{i + 1}</b>
                  <span>{question.text || "Untitled question"}</span>
                </button>
                <button
                  title="Delete question"
                  aria-label={`Delete question ${i + 1}`}
                  disabled={draft.questions.length === 1}
                  onClick={() => remove(i)}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <p className="ar-fineprint">
            Up to 30 questions.
            <br />
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
        </aside>
        <section className="ar-card ar-question-details">
          <div className="ar-detail-heading">
            <h2>
              <Settings />
              Question Details
            </h2>
            <label>
              <Timer />
              Time Limit
              <select
                value={q.seconds}
                onChange={(e) => edit({ seconds: Number(e.target.value) })}
              >
                {[10, 15, 20, 30, 45, 60].map((v) => (
                  <option key={v} value={v}>
                    {v} sec
                  </option>
                ))}
              </select>
              <ChevronDown />
            </label>
          </div>
          <label className="ar-field">
            Quiz Title
            <input
              value={draft.title}
              maxLength={80}
              onChange={(e) => {
                setDraft((d) => ({ ...d, title: e.target.value }));
                setDirty(true);
              }}
            />
          </label>
          <label className="ar-field">
            Question Text <span>*</span>
            <textarea
              value={q.text}
              maxLength={200}
              placeholder="What would you like to ask?"
              onChange={(e) => edit({ text: e.target.value, highlight: "" })}
            />
          </label>
          <div className="ar-field">
            <span>
              Question GIF <small>(Optional)</small>
            </span>
            <UploadMedia
              src={q.gif}
              label="Question GIF"
              onChange={(gif) => edit({ gif })}
            />
            {q.gif && (
              <button
                className="ar-text-link"
                onClick={() => edit({ gif: "" })}
              >
                Remove media
              </button>
            )}
          </div>
          <div className="ar-field">
            <span>
              Options <small>Choose the correct answer</small>
            </span>
            <div className="ar-editor-options">
              {q.options.map((option, i) => (
                <div
                  key={i}
                  className={q.correctIndex === i ? "is-correct" : ""}
                >
                  <button
                    className="ar-correct-picker"
                    title="Mark as correct answer"
                    aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
                    aria-pressed={q.correctIndex === i}
                    onClick={() => edit({ correctIndex: i })}
                  >
                    {q.correctIndex === i ? (
                      <Check />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </button>
                  <input
                    aria-label={`Option ${String.fromCharCode(65 + i)}`}
                    value={option}
                    maxLength={100}
                    placeholder={`Answer ${i + 1}`}
                    onChange={(e) =>
                      edit({
                        options: q.options.map((o, j) =>
                          i === j ? e.target.value : o,
                        ),
                      })
                    }
                  />
                  <button
                    aria-label={`Delete option ${String.fromCharCode(65 + i)}`}
                    disabled={q.options.length <= 2}
                    onClick={() =>
                      edit({
                        options: q.options.filter((_, j) => j !== i),
                        correctIndex:
                          q.correctIndex === i
                            ? 0
                            : q.correctIndex - (i < q.correctIndex ? 1 : 0),
                      })
                    }
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="ar-add-option"
              disabled={q.options.length >= 6}
              onClick={() => edit({ options: [...q.options, ""] })}
            >
              <Plus />
              Add Option
            </button>
          </div>
          <div className="ar-feedback-grid">
            <div>
              <h3>
                <Check />
                Correct Answer GIF
              </h3>
              <UploadMedia
                src={draft.correctGif}
                label="Correct answer GIF"
                onChange={(correctGif) => {
                  setDraft((d) => ({ ...d, correctGif }));
                  setDirty(true);
                }}
              />
            </div>
            <div>
              <h3>
                <X />
                Incorrect Answer GIF
              </h3>
              <UploadMedia
                src={draft.incorrectGif}
                label="Incorrect answer GIF"
                onChange={(incorrectGif) => {
                  setDraft((d) => ({ ...d, incorrectGif }));
                  setDirty(true);
                }}
              />
            </div>
          </div>
          <label className="ar-field">
            <span>
              <BookOpen />
              Explanation <small>(Optional)</small>
            </span>
            <textarea
              value={q.explanation}
              maxLength={400}
              placeholder="Add a short explanation…"
              onChange={(e) => edit({ explanation: e.target.value })}
            />
          </label>
          <p className="ar-fineprint">
            <ImagePlus />
            Upload GIF, PNG, JPG or WebP · max 700 KB per file
          </p>
          <ErrorText message={storageWarning()} />
        </section>
        <aside className="ar-card ar-editor-preview">
          <h2>
            <Monitor />
            Question Preview
          </h2>
          <Preview question={q} />
        </aside>
      </div>
      {preview && (
        <div className="ar-modal-backdrop">
          <section
            className="ar-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Question preview"
          >
            <button
              className="ar-modal-close"
              onClick={() => setPreview(false)}
              aria-label="Close preview"
            >
              <X />
            </button>
            <Preview question={q} />
          </section>
        </div>
      )}
    </AdminShell>
  );
}
