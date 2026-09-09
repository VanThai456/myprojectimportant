import "./FishPondScene.css";
import { useState } from "react";

function FishPondScene({ onComplete }) {
  const [reply, setReply] = useState("");
  const [firstReply, setFirstReply] = useState("");
  const [secondReply, setSecondReply] = useState("");
  const [thirdReply, setThirdReply] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      return;
    }

    if (!firstReply) {
      setFirstReply(trimmedReply);
    } else if (!secondReply) {
      setSecondReply(trimmedReply);
    } else {
      setThirdReply(trimmedReply);
    }

    setReply("");
  };

  return (
    <div className="fishpond-scene">
      <img
        src="/src/assets/fishpond-bg.png"
        alt="Hồ cá"
        className="fishpond-bg"
      />

      <img src="/src/assets/namNgoi.png" alt="Nam" className="fish-boy" />

      <img src="/src/assets/nuNgoi.png" alt="Nữ" className="fish-girl" />

      <img src="/src/assets/ca1.png" alt="Cá" className="fish fish-1" />
      <img src="/src/assets/ca2.png" alt="Cá" className="fish fish-2" />
      <img src="/src/assets/ca1.png" alt="Cá" className="fish fish-3" />

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
              {!firstReply
                ? "Đi hồ cho mát mẽ hé, dạo này sao rồi vẫn khỏe chứ"
                : !secondReply
                  ? "Dạo đây có chuyện gì vui hay có gì muốn kể tôi nghe không"
                  : "sao nè, lâu ngày không gặp có nhớ tui ko nè, có định gặp lại tui nữa không đó"}
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
                <button type="submit">GỬI</button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default FishPondScene;
