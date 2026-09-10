import { useEffect, useState } from "react";
import "./RotatePrompt.css";

function RotatePrompt() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Chỉ áp dụng cho điện thoại hoặc máy tính bảng (màn hình nhỏ/vừa)
      const isMobileDevice =
        window.innerWidth <= 1024 ||
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Kiểm tra màn hình có đang ở trạng thái dọc (chiều cao > chiều rộng) không
      const isPortraitMode =
        window.innerHeight > window.innerWidth ||
        (window.matchMedia &&
          window.matchMedia("(orientation: portrait)").matches);

      setIsPortrait(isMobileDevice && isPortraitMode);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isPortrait || isDismissed) {
    return null;
  }

  return (
    <div
      className="rotate-prompt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Thông báo xoay ngang màn hình"
    >
      <div
        className="rotate-prompt-backdrop"
        onClick={() => setIsDismissed(true)}
      />

      <div className="rotate-prompt-card">
        <div className="rotate-phone-animation" aria-hidden="true">
          <div className="phone-device">
            <span className="phone-screen-sparkle">✦</span>
          </div>
          <svg className="rotate-arrow-svg" viewBox="0 0 50 50">
            <path
              d="M 14 36 A 18 18 0 0 1 36 14"
              fill="none"
              stroke="#ffde8c"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <polygon points="36,9 42,16 33,18" fill="#ffde8c" />
          </svg>
        </div>

        <h2 className="rotate-prompt-title">Xoay ngang màn hình nhé ✨</h2>

        <p className="rotate-prompt-text">
          Hãy xoay ngang điện thoại để ngắm nhìn trọn vẹn khung cảnh và không bỏ
          lỡ các chi tiết thú vị nha!
        </p>

        <div className="rotate-prompt-actions">
          <button
            type="button"
            className="rotate-dismiss-btn"
            onClick={() => setIsDismissed(true)}
          >
            Tiếp tục xem dọc
          </button>
        </div>
      </div>
    </div>
  );
}

export default RotatePrompt;
