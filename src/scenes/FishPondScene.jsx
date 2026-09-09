import "./FishPondScene.css";
import { useState } from "react";
import pondBackground from "../assets/fishpond-bg.png";
import sittingBoy from "../assets/namNgoi.png";
import sittingGirl from "../assets/nuNgoi.png";
import fishOne from "../assets/ca1.png";
import fishTwo from "../assets/ca2.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const questions = [
  "Đi hồ cho mát mẽ hé, dạo này sao rồi vẫn khỏe chứ",
  "Dạo đây có chuyện gì vui hay có gì muốn kể tôi nghe không",
  "sao nè, lâu ngày không gặp có nhớ tui ko nè, có định gặp lại tui nữa không đó",
];

function getSessionId() {
  const key = "phieuluu-gift-session-id";
  const savedSessionId = window.localStorage.getItem(key);
  if (savedSessionId) return savedSessionId;

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(key, sessionId);
  return sessionId;
}

function FishPondScene({ onComplete }) {
  const [reply, setReply] = useState("");
  const [firstReply, setFirstReply] = useState("");
  const [secondReply, setSecondReply] = useState("");
  const [thirdReply, setThirdReply] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      return;
    }

    const answerIndex = firstReply ? (secondReply ? 2 : 1) : 0;

    try {
      setIsSaving(true);
      setSaveError("");
      const response = await fetch(`${API_URL}/api/gift-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: getSessionId(),
          question: questions[answerIndex],
          answer: trimmedReply,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Không thể lưu câu trả lời.");
      }

      if (answerIndex === 0) {
        setFirstReply(trimmedReply);
      } else if (answerIndex === 1) {
        setSecondReply(trimmedReply);
      } else {
        setThirdReply(trimmedReply);
      }
      setReply("");
    } catch (error) {
      setSaveError(error.message || "Không thể lưu câu trả lời.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fishpond-scene">
      <img src={pondBackground} alt="Hồ cá" className="fishpond-bg" />

      <img src={sittingBoy} alt="Nam" className="fish-boy" />

      <img src={sittingGirl} alt="Nữ" className="fish-girl" />

      <img src={fishOne} alt="Cá" className="fish fish-1" />
      <img src={fishTwo} alt="Cá" className="fish fish-2" />
      <img src={fishOne} alt="Cá" className="fish fish-3" />

      <section className="fish-dialogue" aria-live="polite">
        {thirdReply ? (
          <>
            <p className="fish-dialogue-boy fish-dialogue-next">
              Đi đây nè, tôi có vài thứ cho bạn coi nè
            </p>
            <div className="fish-reply-controls fish-next-choice">
              <button type="button" onClick={onComplete}>
                được thôi
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fish-dialogue-boy">
              {questions[firstReply ? (secondReply ? 2 : 1) : 0]}
            </p>
            <form className="fish-reply-form" onSubmit={handleSubmit}>
              <label htmlFor="fish-reply">Trả lời</label>
              <div className="fish-reply-controls">
                <input
                  id="fish-reply"
                  type="text"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Nhập câu trả lời..."
                  autoComplete="off"
                />
                <button type="submit" disabled={isSaving}>
                  {isSaving ? "ĐANG LƯU..." : "GỬI"}
                </button>
              </div>
              {saveError && <p className="fish-save-error">{saveError}</p>}
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default FishPondScene;
