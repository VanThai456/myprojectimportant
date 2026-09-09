import "./CinemaScene.css";
import { useEffect, useState } from "react";
import cinemaBackground from "../assets/cinema-bg.png";
import coupleWalking from "../assets/di.png";
import boyImage from "../assets/boy.png";
import girlImage from "../assets/girl.png";

function CinemaScene({ onComplete }) {
  const [isEnteringCinema, setIsEnteringCinema] = useState(false);

  useEffect(() => {
    if (!isEnteringCinema) {
      return undefined;
    }

    const transitionTimer = setTimeout(onComplete, 3000);

    return () => clearTimeout(transitionTimer);
  }, [isEnteringCinema, onComplete]);

  return (
    <div
      className={`cinema-scene${isEnteringCinema ? " cinema-is-entering" : ""}`}
    >
      {/* Background rạp phim */}
      <img src={cinemaBackground} alt="Rạp phim" className="cinema-bg" />

      {isEnteringCinema ? (
        <img
          src={coupleWalking}
          alt="Hai người đi vào cửa số 2"
          className="cinema-walking-couple"
        />
      ) : (
        <>
          <img src={boyImage} alt="Nam" className="cinema-boy" />
          <img src={girlImage} alt="Nữ" className="cinema-girl" />
        </>
      )}

      {!isEnteringCinema && (
        <section className="cinema-dialogue" aria-live="polite">
          <p>
            ở đây có vài tấm ảnh tôi chụp được có bạn với có ảnh tôi thấy đẹp
            nên khoe, nên xem vui thôi không được giận gì tôi đâu nha
          </p>
          <button type="button" onClick={() => setIsEnteringCinema(true)}>
            coi trước đã tính với bạn sau
          </button>
        </section>
      )}
    </div>
  );
}

export default CinemaScene;
