import "./DoorScene.css";
import { useEffect, useState } from "react";

function DoorScene({ onComplete }) {
  const [choice, setChoice] = useState(null);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  useEffect(() => {
    if (!isDoorOpen) {
      return undefined;
    }

    const transitionTimer = setTimeout(onComplete, 3000);

    return () => clearTimeout(transitionTimer);
  }, [isDoorOpen, onComplete]);

  const openDoor = () => {
    setIsDoorOpen(true);
  };

  return (
    <div className={`door-scene${isDoorOpen ? " door-is-open" : ""}`}>
      <img
        src="/src/assets/door-bg.png"
        alt="Background"
        className="background"
      />

      {isDoorOpen ? (
        <img
          src="/src/assets/di.png"
          alt="Hai người đang đi về phía cánh cửa"
          className="walking-couple"
        />
      ) : (
        <>
          <img src="/src/assets/boy.png" alt="Boy" className="boy" />
          <img src="/src/assets/girl.png" alt="Girl" className="girl" />
        </>
      )}

      <img
        src={isDoorOpen ? "/src/assets/door-open.png" : "/src/assets/door.png"}
        alt={isDoorOpen ? "Open door" : "Door"}
        className="door"
      />

      {!isDoorOpen && (
        <section className="dialogue" aria-live="polite">
          <p className="dialogue-text">
            {choice === "no"
              ? "Thôi mà đi với tôi đi, hôm nay ngày đặc biệt mà"
              : "Xin chào, lâu rồi không gặp hôm nay đi chơi với tôi một lúc nhá"}
          </p>

          {choice === null ? (
            <div className="dialogue-choices">
              <button type="button" onClick={openDoor}>
                được thôi
              </button>
              <button type="button" onClick={() => setChoice("no")}>
                không
              </button>
            </div>
          ) : (
            <div className="dialogue-choices">
              <button type="button" onClick={openDoor}>
                Thôi được rồi
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default DoorScene;
