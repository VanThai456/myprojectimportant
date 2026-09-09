import "./cv2.css";
import cakeBackground from "../assets/cv2-bg.png";
import cakeBoy from "../assets/camBanh.png";
import cakeImage from "../assets/banhKem.png";
import candleImage from "../assets/nen.png";
import { useEffect, useState } from "react";

function Cv2({ onComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);

  useEffect(() => {
    if (!isBlowing) {
      return undefined;
    }

    const transitionTimer = setTimeout(onComplete, 1800);

    return () => clearTimeout(transitionTimer);
  }, [isBlowing, onComplete]);

  return (
    <div className={`cv2-scene${isBlowing ? " cv2-is-dark" : ""}`}>
      {/* Bối cảnh */}
      <img src={cakeBackground} alt="Công viên ban đêm" className="cv2-bg" />

      {/* Nhân vật */}
      <img src={cakeBoy} alt="Nam" className="cv2-boy" />

      {/* Bánh kem */}
      <img src={cakeImage} alt="Bánh kem" className="cv2-cake" />

      {/* Nến */}
      <img src={candleImage} alt="Nến" className="cv2-candle" />

      <section className="cv2-dialogue" aria-live="polite">
        <p>Ta đa, bánh kem đây chúc mừng sinh nhật nha</p>
        <button
          type="button"
          onClick={() => setIsBlowing(true)}
          disabled={isBlowing}
        >
          thổi nến
        </button>
      </section>

      {isBlowing && <div className="cv2-fade-out" aria-hidden="true" />}
    </div>
  );
}

export default Cv2;
