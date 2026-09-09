import "./ParkScene.css";
import { useState } from "react";

function ParkScene({ onComplete }) {
  const [showSecondDialogue, setShowSecondDialogue] = useState(false);

  return (
    <div className="park-scene">
      <img src="/src/assets/park-bg.png" alt="Công viên" className="park-bg" />

      <img src="/src/assets/ngoiCV.png" alt="Nam" className="park-boy" />

      <img src="/src/assets/nuNgoiCV.png" alt="Nữ" className="park-girl" />

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
