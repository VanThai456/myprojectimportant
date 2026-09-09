import DoorScene from "./scenes/DoorScene";
import FishPondScene from "./scenes/FishPondScene";
import CinemaScene from "./scenes/CinemaScene";
import InC from "./scenes/inC";
import ParkScene from "./scenes/ParkScene";
import Cv2 from "./scenes/cv2";
import StarrySky from "./scenes/StarrySky";
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://myprojectimportant.onrender.com";

function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password.length !== 8) {
      setMessage("Vui lòng nhập đủ 8 chữ số.");
      return;
    }

    setIsChecking(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok || !result.valid) {
        setMessage(result.message || "Mật khẩu không đúng.");
        return;
      }
      onUnlock();
    } catch {
      setMessage("Không thể kết nối máy chủ.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="password-gate">
      <section className="password-panel" aria-labelledby="password-title">
        <p className="password-kicker">PRIVATE JOURNEY</p>
        <h1 id="password-title">Nhập mật khẩu</h1>
        <p className="password-description">
          Bạn chỉ có thể được xem khi nhập đúng mật khẩu
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="site-password">Mật khẩu</label>
          <input
            id="site-password"
            type="password"
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value.replace(/\D/g, ""));
              setMessage("");
            }}
            placeholder="••••••••"
            autoFocus
            required
          />
          <button type="submit" disabled={isChecking || password.length !== 8}>
            {isChecking ? "Đang kiểm tra..." : "Xác nhận"}
          </button>
        </form>
        <p
          className={`password-message${message ? " is-visible" : ""}`}
          role="alert"
        >
          {message || " "}
        </p>
      </section>
    </main>
  );
}

function OrientationControls({ children }) {
  const [orientation, setOrientation] = useState(() =>
    window.matchMedia("(orientation: landscape)").matches
      ? "landscape"
      : "portrait",
  );
  const [showNotice, setShowNotice] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.matchMedia("(orientation: landscape)").matches
          ? "landscape"
          : "portrait",
      );
    };

    window.addEventListener("resize", updateOrientation);
    window.screen?.orientation?.addEventListener?.("change", updateOrientation);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.screen?.orientation?.removeEventListener?.(
        "change",
        updateOrientation,
      );
    };
  }, []);

  useEffect(() => {
    const noticeTimer = setTimeout(() => setShowNotice(false), 9000);
    return () => clearTimeout(noticeTimer);
  }, []);

  async function toggleOrientation() {
    const nextOrientation =
      orientation === "landscape" ? "portrait" : "landscape";
    setStatus("");

    try {
      if (nextOrientation === "landscape" && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else if (nextOrientation === "portrait" && document.fullscreenElement) {
        await document.exitFullscreen?.();
      }

      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock(nextOrientation);
      }
      setOrientation(nextOrientation);
    } catch {
      setStatus(
        "Thiết bị chưa cho phép khóa hướng màn hình. Bạn hãy xoay máy thủ công nhé.",
      );
    }
  }

  return (
    <div className={`orientation-shell is-${orientation}`}>
      {children}
      {showNotice && orientation === "portrait" && (
        <div className="orientation-notice" role="status">
          <span className="orientation-notice-icon" aria-hidden="true">
            ↔
          </span>
          <p>Hãy xoay ngang điện thoại để có trải nghiệm tốt nhất.</p>
          <button
            type="button"
            onClick={() => setShowNotice(false)}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      )}
      <button
        type="button"
        className="orientation-toggle"
        onClick={toggleOrientation}
        aria-label={
          orientation === "landscape"
            ? "Chuyển sang màn hình dọc"
            : "Chuyển sang màn hình ngang"
        }
        title={
          orientation === "landscape" ? "Chuyển sang dọc" : "Chuyển sang ngang"
        }
      >
        <span aria-hidden="true">
          {orientation === "landscape" ? "↕" : "↔"}
        </span>
        <small>{orientation === "landscape" ? "Dọc" : "Ngang"}</small>
      </button>
      {status && (
        <p className="orientation-status" role="status">
          {status}
        </p>
      )}
    </div>
  );
}

function App() {
  const [scene, setScene] = useState("door");
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  let currentScene = null;
  if (scene === "door")
    currentScene = <DoorScene onComplete={() => setScene("fishpond")} />;
  if (scene === "fishpond")
    currentScene = <FishPondScene onComplete={() => setScene("cinema")} />;
  if (scene === "cinema")
    currentScene = <CinemaScene onComplete={() => setScene("inc")} />;
  if (scene === "inc")
    currentScene = <InC onComplete={() => setScene("park")} />;
  if (scene === "park")
    currentScene = <ParkScene onComplete={() => setScene("cv2")} />;
  if (scene === "cv2")
    currentScene = <Cv2 onComplete={() => setScene("starry-sky")} />;
  if (scene === "starry-sky") currentScene = <StarrySky />;

  return <OrientationControls>{currentScene}</OrientationControls>;
}

export default App;
