import "./ParkScene.css";
import parkBackground from "../assets/park-bg.png";
import sittingBoy from "../assets/ngoiCV.png";
import sittingGirl from "../assets/nuNgoiCV.png";
import { useState } from "react";

function ParkScene({ onComplete }) {
  const [showSecondDialogue, setShowSecondDialogue] = useState(false);

  return (
    <div className="park-scene">
      <img src={parkBackground} alt="Công viên" className="park-bg" />

      <img src={sittingBoy} alt="Nam" className="park-boy" />

      <img src={sittingGirl} alt="Nữ" className="park-girl" />

      <section className="park-dialogue" aria-live="polite">
        {showSecondDialogue ? (
          <>
            <p>Đúng rồi sinh nhật là phải có bánh kem chứ đợi tui tí nhá....</p>
            <button type="button" onClick={onComplete}>
              tiếp
            </button>
          </>
        ) : (
          <>
            <p>
              Hôm nay là sinh nhật bạn mà tôi không ở gần bạn nên không đi chơi
              với bạn được, nên tôi làm web này để làm món quà tinh thần cho bạn
              nhe,
            </p>
            <button type="button" onClick={() => setShowSecondDialogue(true)}>
              tiếp
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default ParkScene;
