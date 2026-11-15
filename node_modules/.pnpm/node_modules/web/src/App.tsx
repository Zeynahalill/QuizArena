import { Link, Route, Routes } from "react-router";
import AdminLoginPage from "./features/admin-auth/AdminLoginPage";
import QuizPlayPage from "./features/quiz-play/QuizPlayPage";
import HomePage, { Dashboard } from "./features/arena/HomePage";
import GameManagement from "./features/arena/GameManagement";
import QuizEditor from "./features/arena/QuizEditor";
import { EnterName, JoinGame, Lobby } from "./features/arena/JoinPages";
import { LivePlayer, MainScreen, Results } from "./features/arena/LiveScreens";
import { Logo, Surface } from "./features/arena/ArenaShared";
import "./features/arena/screenPolish.css";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/quizzes" element={<QuizEditor />} />
      <Route path="/create" element={<QuizEditor />} />
      <Route path="/admin/game" element={<GameManagement />} />
      <Route path="/join" element={<JoinGame />} />
      <Route path="/join/name" element={<EnterName />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/play" element={<QuizPlayPage />} />
      <Route path="/play/live" element={<LivePlayer />} />
      <Route path="/main" element={<MainScreen />} />
      <Route path="/results" element={<Results />} />
      <Route
        path="*"
        element={
          <Surface className="ar-not-found">
            <Logo />
            <h1>Page not found</h1>
            <Link className="ar-button" to="/">
              Back to Home
            </Link>
          </Surface>
        }
      />
    </Routes>
  );
}
