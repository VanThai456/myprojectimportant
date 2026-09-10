import { useCallback, useEffect, useRef, useState } from "react";
import "./inC.css";
import cinemaInterior from "../assets/trongC.png";
import TypewriterText from "../components/TypewriterText";

const API_URL =
  import.meta.env.VITE_API_URL || "https://myprojectimportant.onrender.com";

function InC({ onComplete, onCountdownComplete }) {
  const [phase, setPhase] = useState("intro");
  const [countdown, setCountdown] = useState(3);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState("");
  const [isDialogueReady, setIsDialogueReady] = useState(false);
  const timersRef = useRef([]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const startProjection = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    setPhase("loading");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/images`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Không thể tải kho ảnh.");
      }

      const photoList = data.images || [];
      setImages(photoList);
      setPhase("countdown");
      timersRef.current.push(
        setTimeout(() => setCountdown(2), 1000),
        setTimeout(() => setCountdown(1), 2000),
        setTimeout(() => {
          setActiveIndex(0);
          onCountdownComplete();
          setIsDialogueReady(false);
          setPhase(photoList.length > 0 ? "showing" : "empty");
        }, 3000),
      );
    } catch (requestError) {
      setError(requestError.message || "Không thể kết nối máy chủ.");
      setIsDialogueReady(false);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(startProjection, 0);
    return () => clearTimeout(startTimer);
  }, [startProjection]);

  useEffect(() => {
    if (phase !== "showing") return;

    const timer = setTimeout(() => {
      if (activeIndex >= images.length - 1) {
        setPhase("finished");
      } else {
        setActiveIndex((currentIndex) => currentIndex + 1);
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [activeIndex, images.length, phase]);

  const isFinished = phase === "empty" || phase === "finished";

  return (
    <div className={`inc-scene inc-phase-${phase}`}>
      <img src={cinemaInterior} alt="Trong rạp phim" className="inc-image" />

      <div className="inc-darkness" aria-hidden="true" />

      {phase === "countdown" && (
        <div className="inc-countdown" aria-live="assertive">
          <span key={countdown}>{countdown}</span>
        </div>
      )}

      {phase === "showing" && images[activeIndex] && (
        <div
          className="inc-projection"
          key={images[activeIndex].id || activeIndex}
        >
          <div className="inc-film-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <img
            src={images[activeIndex].img}
            alt={`Kỷ niệm ${activeIndex + 1}`}
            className="inc-memory-image"
          />
          <p className="inc-photo-counter">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      )}

      {phase === "loading" && (
        <p className="inc-status">Đang chuẩn bị thước phim...</p>
      )}

      {phase === "error" && (
        <section className="inc-dialogue inc-error-dialogue" aria-live="polite">
          <p>
            <TypewriterText
              text={error}
              onComplete={() => setIsDialogueReady(true)}
            />
          </p>
          {isDialogueReady && (
            <button
              type="button"
              onClick={() => {
                hasStartedRef.current = false;
                setIsDialogueReady(false);
                setPhase("intro");
                startProjection();
              }}
            >
              Thử lại
            </button>
          )}
        </section>
      )}

      {isFinished && (
        <section
          className="inc-dialogue inc-finish-dialogue"
          aria-live="polite"
        >
          <p>
            <TypewriterText
              text="tôi còn 1 chổ muốn dẫn bạn đi nữa, đi thôi"
              onComplete={() => setIsDialogueReady(true)}
            />
          </p>
          {isDialogueReady && (
            <button type="button" onClick={onComplete}>
              OK
            </button>
          )}
        </section>
      )}
    </div>
  );
}

export default InC;
