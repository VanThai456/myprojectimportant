import DoorScene from "./scenes/DoorScene";
import FishPondScene from "./scenes/FishPondScene";
import CinemaScene from "./scenes/CinemaScene";
import InC from "./scenes/inC";
import ParkScene from "./scenes/ParkScene";
import Cv2 from "./scenes/cv2";
import StarrySky from "./scenes/StarrySky";
import RotatePrompt from "./components/RotatePrompt";
import nhacDiChoi from "./assets/nhadichoi.mp3";
import nhac from "./assets/nhac.mp3";
import cv from "./assets/cv.mp3";
import kg from "./assets/kg.mp3";
import bk from "./assets/bk.mp3";
import { useRef, useState } from "react";
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

function AudioControl({ volume, onVolumeChange }) {
  const isMuted = volume === 0;

  return (
    <div className="audio-control" aria-label="Điều chỉnh âm thanh">
      <span className="audio-control-icon" aria-hidden="true">
        {isMuted ? "🔇" : "🔊"}
      </span>
      <label htmlFor="journey-volume">Âm lượng</label>
      <input
        id="journey-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="Âm lượng nhạc"
      />
    </div>
  );
}

function App() {
  const [scene, setScene] = useState("door");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const musicRef = useRef(null);
  const volumeRef = useRef(0.65);

  function handleVolumeChange(nextVolume) {
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    if (musicRef.current) {
      musicRef.current.volume = nextVolume;
    }
  }

  function unlockJourney() {
    playMusic(nhacDiChoi);
    setIsUnlocked(true);
  }

  function playMusic(source) {
    const music = musicRef.current || new Audio();
    music.pause();
    music.src = source;
    music.currentTime = 0;
    music.loop = true;
    music.volume = volumeRef.current;
    musicRef.current = music;
    music.load();
    music.play().catch(() => {
      // Giữ nguyên audio đã được người dùng kích hoạt để lần đổi bài sau không bị mất quyền phát.
    });
  }

  if (!isUnlocked) {
    return <PasswordGate onUnlock={unlockJourney} />;
  }

  let currentScene = null;
  if (scene === "door")
    currentScene = <DoorScene onComplete={() => setScene("fishpond")} />;
  if (scene === "fishpond")
    currentScene = <FishPondScene onComplete={() => setScene("cinema")} />;
  if (scene === "cinema")
    currentScene = <CinemaScene onComplete={() => setScene("inc")} />;
  if (scene === "inc")
    currentScene = (
      <InC
        onComplete={() => {
          playMusic(cv);
          setScene("park");
        }}
        onCountdownComplete={() => playMusic(nhac)}
      />
    );
  if (scene === "park")
    currentScene = (
      <ParkScene
        onComplete={() => {
          playMusic(bk);
          setScene("cv2");
        }}
      />
    );
  if (scene === "cv2")
    currentScene = (
      <Cv2
        onComplete={() => setScene("starry-sky")}
        onBlowCandle={() => playMusic(kg)}
      />
    );
  if (scene === "starry-sky") currentScene = <StarrySky />;

  return (
    <>
      {currentScene}
      {scene !== "door" && <RotatePrompt />}
      <AudioControl volume={volume} onVolumeChange={handleVolumeChange} />
    </>
  );
}

export default App;
