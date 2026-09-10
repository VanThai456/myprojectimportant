import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import PhotoGalleryModal from "../components/PhotoGalleryModal";
import "./StarrySky.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://myprojectimportant.onrender.com";

const birthdayLetters = [
  "Chúc cậu có một sinh nhật thật vui, 1 ngày tuyệt vời và 1 tuổi mới thật hạnh phúc.",
  "Chúc cậu sẽ thực hiện được điều mà mình mong muốn trong năm mới",
  "Chúc cậu có 1 cuộc sống như cậu mong muốn, được đi chơi, được ngủ, được ăn, được làm điều mình muốn",
  "Chúc cậu luôn được yêu thương, bình an và gặp thật nhiều may mắn.",
  "Tuổi mới thật rực rỡ và gặp nhiều may mắn nhá",
];

function StarrySky() {
  const mountRef = useRef(null);
  const nextLetterIndexRef = useRef(0);
  const [letters, setLetters] = useState([]);
  const [openedLetter, setOpenedLetter] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  const handleImageCountChange = useCallback((count) => {
    setImageCount(count);
  }, []);

  // Lấy số lượng ảnh ban đầu từ database để hiện badge
  useEffect(() => {
    fetch(`${API_URL}/api/images`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.images) {
          setImageCount(data.images.length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const topPositions = [8, 20, 12, 28, 16, 36];
    const durations = [3.6, 4.0, 3.8, 4.2, 3.7];
    const angles = [140, 137, 143, 139, 142];

    const spawnLetter = () => {
      const letterIndex = nextLetterIndexRef.current % birthdayLetters.length;
      nextLetterIndexRef.current += 1;

      setLetters((currentLetters) => [
        ...currentLetters,
        {
          id: `${letterIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          message: birthdayLetters[letterIndex],
          startTop: topPositions[letterIndex % topPositions.length],
          startRight: -8 - ((letterIndex * 3) % 8),
          duration: durations[letterIndex % durations.length],
          angle: angles[letterIndex % angles.length],
        },
      ]);
    };

    // Bắt đầu sao băng đầu tiên sau 4.5s (khi bầu trời sao vừa mở ra hoàn toàn)
    const firstLetterTimer = setTimeout(spawnLetter, 4500);
    const letterTimer = setInterval(spawnLetter, 8500);

    return () => {
      clearTimeout(firstLetterTimer);
      clearInterval(letterTimer);
    };
  }, []);

  // =========================================
  // THREE.JS
  // =========================================
  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020617);

    const galaxyPalettes = [
      {
        background: new THREE.Color(0x09051f),
        stars: new THREE.Color(0xffd6ff),
      },
      {
        background: new THREE.Color(0x061d35),
        stars: new THREE.Color(0xb9f5ff),
      },
      {
        background: new THREE.Color(0x260629),
        stars: new THREE.Color(0xffd1e8),
      },
      {
        background: new THREE.Color(0x071b2f),
        stars: new THREE.Color(0xc8d5ff),
      },
    ];

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );

    camera.position.z = 5;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(window.innerWidth, window.innerHeight);

    mount.appendChild(renderer.domElement);

    // =========================================
    // TẠO SAO
    // =========================================

    const starGroups = [];
    const starRevealTargets = [];

    function createStars(count, radius, size, opacity) {
      const geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const r = radius * (0.6 + Math.random() * 0.4);

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);

        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);

        positions[i3 + 2] = r * Math.cos(phi);
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
      });

      material.userData = { targetOpacity: opacity };
      material.opacity = 0;

      const stars = new THREE.Points(geometry, material);

      scene.add(stars);
      starGroups.push(stars);
      starRevealTargets.push(material);
    }

    // Nhiều lớp sao
    createStars(3500, 500, 0.8, 0.5);
    createStars(1400, 300, 1.4, 0.8);
    createStars(450, 120, 2.3, 1);

    // =========================================
    // CẢM BIẾN ĐIỆN THOẠI
    // =========================================

    let targetRotationX = 0;
    let targetRotationY = 0;

    let currentRotationX = 0;
    let currentRotationY = 0;
    let baseBeta = null;
    let baseGamma = null;

    const handleDeviceOrientation = (event) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      if (baseBeta === null || baseGamma === null) {
        baseBeta = beta;
        baseGamma = gamma;
      }

      targetRotationX = THREE.MathUtils.clamp(
        THREE.MathUtils.degToRad(beta - baseBeta) * 0.9,
        -0.45,
        0.45,
      );

      targetRotationY = THREE.MathUtils.clamp(
        THREE.MathUtils.degToRad(gamma - baseGamma) * 0.9,
        -0.45,
        0.45,
      );
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    const requestMotionPermission = () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        DeviceOrientationEvent.requestPermission().catch(() => undefined);
      }

      window.removeEventListener("pointerdown", requestMotionPermission);
    };

    window.addEventListener("pointerdown", requestMotionPermission, {
      once: true,
    });

    // =========================================
    // TOUCH
    // =========================================

    let touchX = 0;
    let touchY = 0;

    const handleTouchMove = (event) => {
      const touch = event.touches[0];

      if (!touch) return;

      touchX = (touch.clientX / window.innerWidth - 0.5) * 0.4;

      touchY = (touch.clientY / window.innerHeight - 0.5) * 0.4;
    };

    const handleTouchEnd = () => {
      touchX = 0;
      touchY = 0;
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    window.addEventListener("touchend", handleTouchEnd);

    // =========================================
    // RESIZE
    // =========================================

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // =========================================
    // ANIMATION
    // =========================================

    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      const revealProgress = THREE.MathUtils.clamp((elapsed - 1.8) / 2.2, 0, 1);

      const palettePosition = elapsed / 5;
      const paletteIndex = Math.floor(palettePosition) % galaxyPalettes.length;
      const nextPaletteIndex = (paletteIndex + 1) % galaxyPalettes.length;
      const paletteProgress = palettePosition - Math.floor(palettePosition);
      const smoothPaletteProgress =
        paletteProgress * paletteProgress * (3 - 2 * paletteProgress);
      const currentPalette = galaxyPalettes[paletteIndex];
      const nextPalette = galaxyPalettes[nextPaletteIndex];

      scene.background.lerpColors(
        currentPalette.background,
        nextPalette.background,
        smoothPaletteProgress,
      );

      starRevealTargets.forEach((material) => {
        material.opacity = material.userData.targetOpacity * revealProgress;
        material.color.lerpColors(
          currentPalette.stars,
          nextPalette.stars,
          smoothPaletteProgress,
        );
      });

      // SAO TRÔI
      starGroups.forEach((group, index) => {
        group.rotation.y += 0.00025 * (index + 1);

        group.rotation.x += 0.00004 * (index + 1);
      });

      // NGHIÊNG ĐIỆN THOẠI
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;

      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      // CAMERA
      camera.rotation.x +=
        (-currentRotationX - touchY * 0.5 - camera.rotation.x) * 0.05;

      camera.rotation.y +=
        (-currentRotationY - touchX * 0.5 - camera.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // =========================================
    // CLEANUP
    // =========================================

    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener("deviceorientation", handleDeviceOrientation);

      window.removeEventListener("pointerdown", requestMotionPermission);

      window.removeEventListener("touchmove", handleTouchMove);

      window.removeEventListener("touchend", handleTouchEnd);

      window.removeEventListener("resize", handleResize);

      renderer.dispose();

      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="starry-sky">
      <div ref={mountRef} className="starry-canvas" />

      <div className="starry-intro" aria-hidden="true">
        <div className="starry-rising-light" />
      </div>

      <div className="starry-title">
        <div className="starry-small">MỘT BẦU TRỜI DÀNH CHO CẬU</div>
        <div className="starry-subtitle">
          ✨ Chạm vào bức thư sao băng để mở lời chúc ✨
        </div>
      </div>

      <div
        className="birthday-letters"
        aria-label="Những bức thư sao băng chúc sinh nhật"
      >
        {letters.map((letter) => (
          <button
            key={letter.id}
            type="button"
            className="shooting-letter-btn"
            style={{
              "--star-top": `${letter.startTop}%`,
              "--star-right": `${letter.startRight}px`,
              "--star-duration": `${letter.duration}s`,
              "--star-angle": `${letter.angle}deg`,
            }}
            aria-label="Bức thư sao băng chúc sinh nhật - Chạm để mở"
            title="Chạm để mở lời chúc"
            onAnimationEnd={(event) => {
              if (event.animationName !== "shooting-star-streak") {
                return;
              }

              setLetters((currentLetters) =>
                currentLetters.filter(
                  (currentLetter) => currentLetter.id !== letter.id,
                ),
              );
            }}
            onClick={() => {
              setLetters((currentLetters) =>
                currentLetters.filter(
                  (currentLetter) => currentLetter.id !== letter.id,
                ),
              );
              setOpenedLetter(letter.message);
            }}
          >
            {/* Đuôi ánh sáng sao băng phía sau */}
            <div className="meteor-trail" aria-hidden="true">
              <div className="meteor-trail-aura" />
              <div className="meteor-trail-body" />
              <div className="meteor-trail-core" />
              <span className="meteor-sparkle s1" />
              <span className="meteor-sparkle s2" />
              <span className="meteor-sparkle s3" />
              <span className="meteor-sparkle s4" />
            </div>

            {/* Đầu sao băng mang Icon Bức Thư phát sáng */}
            <div className="meteor-head">
              <div className="meteor-head-glow" aria-hidden="true" />
              <div className="meteor-head-flare" aria-hidden="true" />

              <div className="envelope-wrapper">
                <svg
                  className="envelope-svg"
                  viewBox="0 0 46 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id={`envGrad-${letter.id}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#fff8e7" />
                      <stop offset="100%" stopColor="#ffd88d" />
                    </linearGradient>
                    <linearGradient
                      id={`flapGrad-${letter.id}`}
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ffeaba" />
                    </linearGradient>
                    <radialGradient
                      id={`sealGlow-${letter.id}`}
                      cx="50%"
                      cy="50%"
                      r="50%"
                    >
                      <stop offset="0%" stopColor="#ff4d79" />
                      <stop offset="100%" stopColor="#d91b48" />
                    </radialGradient>
                  </defs>

                  {/* Thân phong bì */}
                  <rect
                    x="1.5"
                    y="1.5"
                    width="43"
                    height="29"
                    rx="4"
                    fill={`url(#envGrad-${letter.id})`}
                    stroke="#f6ca79"
                    strokeWidth="1.2"
                  />

                  {/* Nếp gấp mặt trong */}
                  <path
                    d="M2 30L17 17.5"
                    stroke="#e4b055"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                  <path
                    d="M44 30L29 17.5"
                    stroke="#e4b055"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.65"
                  />

                  {/* Nếp gấp dưới */}
                  <path
                    d="M2 30L23 15.5L44 30"
                    fill="#ffd47d"
                    fillOpacity="0.42"
                  />

                  {/* Nắp phong bì gấp xuống */}
                  <path
                    d="M2 2C2 2 17.5 16 22.4 19.4C22.8 19.7 23.2 19.7 23.6 19.4C28.5 16 44 2 44 2"
                    fill={`url(#flapGrad-${letter.id})`}
                    stroke="#f6ca79"
                    strokeWidth="1.2"
                  />

                  {/* Nút niêm phong trái tim đỏ hồng */}
                  <circle
                    cx="23"
                    cy="18.5"
                    r="4"
                    fill={`url(#sealGlow-${letter.id})`}
                  />
                  <path
                    d="M23 20L21.5 18.5C21 18 21 17.3 21.5 16.8C22 16.3 22.7 16.3 23 16.8C23.3 16.3 24 16.3 24.5 16.8C25 17.3 25 18 24.5 18.5L23 20Z"
                    fill="#ffffff"
                  />
                </svg>

                <span className="envelope-glint" aria-hidden="true">
                  ✦
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {openedLetter && (
        <div
          className="birthday-letter-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenedLetter(null);
          }}
        >
          <div className="letter-aurora-glow" aria-hidden="true" />

          <article className="birthday-letter-paper">
            {/* 4 Góc họa tiết ngôi sao ánh kim */}
            <span className="corner-decor top-left" aria-hidden="true">
              ✦
            </span>
            <span className="corner-decor top-right" aria-hidden="true">
              ✦
            </span>
            <span className="corner-decor bottom-left" aria-hidden="true">
              ✦
            </span>
            <span className="corner-decor bottom-right" aria-hidden="true">
              ✦
            </span>

            {/* Tem thư vũ trụ cổ điển góc trên bên phải */}
            <div className="vintage-stamp" aria-hidden="true">
              <div className="stamp-inner">
                <span className="stamp-icon">⭐</span>
                <span className="stamp-title">STAR MAIL</span>
                <span className="stamp-sub">№ 13.09</span>
              </div>
              <div className="postmark-circle">
                <span>GALAXY</span>
              </div>
            </div>

            {/* Tiêu đề & Huy hiệu phong bì sao */}
            <div className="letter-header">
              <div className="letter-seal-badge">
                <span className="seal-icon">💌</span>
              </div>
              <p className="birthday-letter-label">BỨC THƯ TỪ CÁC VÌ SAO</p>
              <div className="letter-divider" aria-hidden="true">
                <span className="divider-line" />
                <span className="divider-sparkle">✦ ⋆ ✦</span>
                <span className="divider-line" />
              </div>
            </div>

            {/* Nội dung lời chúc kèm dấu trích dẫn nghệ thuật */}
            <div className="letter-body">
              <span className="quote-mark open-quote" aria-hidden="true">
                “
              </span>
              <p className="birthday-letter-message">{openedLetter}</p>
              <span className="quote-mark close-quote" aria-hidden="true">
                ”
              </span>
            </div>

            {/* Lời đề từ dưới bức thư */}
            <div className="letter-signoff">
              <span className="signoff-star" aria-hidden="true">
                ✨
              </span>
              <p className="signoff-text">
                Nguyện ước tuổi mới của cậu luôn rực rỡ và bình an
              </p>
              <span className="signoff-star" aria-hidden="true">
                ✨
              </span>
            </div>

            {/* Nút gấp thư lại */}
            <div className="letter-actions">
              <button
                type="button"
                className="birthday-letter-close"
                onClick={() => setOpenedLetter(null)}
              >
                <span>Gấp thư lại</span>
                <span className="btn-sparkle" aria-hidden="true">
                  ✦
                </span>
              </button>
            </div>
          </article>
        </div>
      )}

      {/* Nút Kho Ảnh ở góc dưới màn hình */}
      <button
        type="button"
        className="floating-gallery-btn"
        onClick={() => setIsGalleryOpen(true)}
        aria-label="Mở kho ảnh kỷ niệm"
        title="Mở kho ảnh kỷ niệm"
      >
        <span className="gallery-btn-icon" aria-hidden="true">
          📸
        </span>
        <span>Kho ảnh</span>
        {imageCount > 0 && (
          <span className="gallery-count-badge">{imageCount}</span>
        )}
      </button>

      {/* Modal Kho ảnh kỷ niệm */}
      <PhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onCountChange={handleImageCountChange}
      />
    </div>
  );
}

export default StarrySky;
