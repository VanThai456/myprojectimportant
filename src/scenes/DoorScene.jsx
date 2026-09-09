import "./DoorScene.css";
import { useEffect, useState } from "react";
import doorBackground from "../assets/door-bg.png";
import coupleWalking from "../assets/di.png";
import boyImage from "../assets/boy.png";
import girlImage from "../assets/girl.png";
import doorImage from "../assets/door.png";
import openDoorImage from "../assets/door-open.png";

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
      <img src={doorBackground} alt="Background" className="background" />

      {isDoorOpen ? (
        <img
          src={coupleWalking}
          alt="Hai người đang đi về phía cánh cửa"
          className="walking-couple"
        />
      ) : (
        <>
          <img src={boyImage} alt="Boy" className="boy" />
          <img src={girlImage} alt="Girl" className="girl" />
        </>
      )}

      <img
        src={isDoorOpen ? openDoorImage : doorImage}
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
