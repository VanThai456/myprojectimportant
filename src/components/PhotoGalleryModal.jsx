import { useState, useEffect, useRef, useCallback } from "react";
import "./PhotoGalleryModal.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://myprojectimportant.onrender.com";

// Tiện ích nén ảnh client-side sang Base64 chuẩn bị lưu vào database
function compressImage(file, maxDimension = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Tiện ích tải ảnh về máy
async function downloadImage(src, filename = "starry-memory.jpg") {
  try {
    if (src.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = src;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(src);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback mở tab mới nếu bị chặn CORS
    window.open(src, "_blank");
  }
}

function PhotoGalleryModal({ isOpen, onClose, onCountChange }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  // Tải danh sách ảnh từ API
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/images`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể tải danh sách ảnh.");
      }
      const list = data.images || [];
      setImages(list);
      if (onCountChange) onCountChange(list.length);
    } catch (err) {
      setError(err.message || "Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, fetchImages]);

  // Phím tắt bàn phím cho Lightbox & Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        }
        if (e.key === "ArrowRight") {
          setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, lightboxIndex, images.length, onClose]);

  // Xử lý chọn file ảnh
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const compressedDataUrl = await compressImage(file);
      setPreviewUrl(compressedDataUrl);
      setShowAddForm(true);
    } catch {
      setError("Không thể đọc file ảnh này. Vui lòng chọn ảnh khác.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Xử lý nhập URL
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
  };

  // Lưu ảnh lên cơ sở dữ liệu
  const handleSaveImage = async () => {
    if (!previewUrl) return;

    try {
      setUploading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ img: previewUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Lưu ảnh thất bại.");
      }

      // Thêm ảnh mới vào đầu danh sách
      const updatedList = [data.image, ...images];
      setImages(updatedList);
      if (onCountChange) onCountChange(updatedList.length);

      // Đặt lại form
      setPreviewUrl("");
      setUrlInput("");
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || "Không thể lưu ảnh.");
    } finally {
      setUploading(false);
    }
  };

  // Xóa ảnh
  const handleDeleteImage = async (id, e) => {
    if (e) e.stopPropagation();

    try {
      const res = await fetch(`${API_URL}/api/images/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể xóa ảnh.");
      }

      const updatedList = images.filter((item) => item.id !== id);
      setImages(updatedList);
      if (onCountChange) onCountChange(updatedList.length);

      if (lightboxIndex !== null) {
        if (updatedList.length === 0) {
          setLightboxIndex(null);
        } else if (lightboxIndex >= updatedList.length) {
          setLightboxIndex(updatedList.length - 1);
        }
      }
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.message || "Không thể xóa ảnh.");
    }
  };

  if (!isOpen) return null;

  const currentLightboxImage =
    lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="photo-gallery-overlay" role="dialog" aria-modal="true">
      <div className="gallery-backdrop" onClick={onClose} />

      <div className="gallery-container">
        {/* Header Kho Ảnh */}
        <header className="gallery-header">
          <div className="gallery-title-group">
            <span className="gallery-header-icon">📸</span>
            <div>
              <h2 className="gallery-title">KHO ẢNH KỶ NIỆM</h2>
              <p className="gallery-subtitle">
                {images.length > 0
                  ? `Đang lưu giữ ${images.length} khoảnh khắc đáng nhớ`
                  : "Nơi lưu giữ những khoảnh khắc đẹp nhất"}
              </p>
            </div>
          </div>

          <div className="gallery-header-actions">
            <button
              type="button"
              className="gallery-btn-add"
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              <span>{showAddForm ? "✕ Hủy thêm" : "✨ Thêm ảnh"}</span>
            </button>
            <button
              type="button"
              className="gallery-btn-close"
              onClick={onClose}
              aria-label="Đóng kho ảnh"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Khung thêm ảnh */}
        {showAddForm && (
          <section className="gallery-add-panel">
            <h3 className="add-panel-title">Thêm ảnh mới vào kho</h3>
            <div className="add-options">
              {/* Nút tải ảnh từ máy tính/điện thoại */}
              <label className="upload-file-label">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
                <span className="upload-file-btn">📁 Chọn ảnh từ thiết bị</span>
              </label>

              <span className="add-or-divider">hoặc</span>

              {/* Form nhập URL */}
              <form onSubmit={handleUrlSubmit} className="add-url-form">
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh (URL)..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="add-url-input"
                  disabled={uploading}
                />
                <button
                  type="submit"
                  className="add-url-btn"
                  disabled={uploading || !urlInput.trim()}
                >
                  Xem thử
                </button>
              </form>
            </div>

            {/* Xem trước ảnh trước khi lưu */}
            {previewUrl && (
              <div className="preview-container">
                <div className="preview-image-wrapper">
                  <img
                    src={previewUrl}
                    alt="Xem trước ảnh"
                    className="preview-image"
                  />
                </div>
                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn-confirm-save"
                    onClick={handleSaveImage}
                    disabled={uploading}
                  >
                    {uploading ? "⏳ Đang lưu ảnh..." : "💾 Lưu vào kho ảnh"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-preview"
                    onClick={() => {
                      setPreviewUrl("");
                      setUrlInput("");
                    }}
                    disabled={uploading}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="gallery-alert-error" role="alert">
            <span>⚠️ {error}</span>
            <button
              type="button"
              className="gallery-btn-retry"
              onClick={fetchImages}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Danh sách ảnh dạng lưới */}
        <div className="gallery-content">
          {loading ? (
            <div className="gallery-loading">
              <div className="loading-star-spinner" />
              <p>Đang mở kho ảnh vũ trụ...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="gallery-empty">
              <span className="empty-icon">🌌</span>
              <h3>Chưa có bức ảnh nào trong kho</h3>
              <p>
                Hãy bấm nút <strong>✨ Thêm ảnh</strong> phía trên để lưu giữ
                những kỷ niệm tuyệt vời đầu tiên nhé!
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setLightboxIndex(index)}
                >
                  <div className="card-image-wrap">
                    <img
                      src={item.img}
                      alt={`Kỷ niệm ${index + 1}`}
                      loading="lazy"
                      className="card-image"
                    />
                  </div>

                  {/* Thanh công cụ hover trên từng ảnh */}
                  <div
                    className="card-overlay"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="card-tool-btn zoom"
                      title="Xem phóng to"
                      onClick={() => setLightboxIndex(index)}
                    >
                      🔍
                    </button>
                    <button
                      type="button"
                      className="card-tool-btn download"
                      title="Lưu ảnh về máy"
                      onClick={() =>
                        downloadImage(
                          item.img,
                          `ky-niem-${item.id || index + 1}.jpg`,
                        )
                      }
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      className="card-tool-btn delete"
                      title="Xóa ảnh này"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(item.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Hộp thoại xác nhận xóa ảnh nhỏ */}
                  {confirmDeleteId === item.id && (
                    <div
                      className="card-confirm-delete"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p>Xóa ảnh này?</p>
                      <div className="confirm-btns">
                        <button
                          type="button"
                          className="btn-yes"
                          onClick={(e) => handleDeleteImage(item.id, e)}
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          className="btn-no"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ngày tạo (nếu có) */}
                  {item.created_at && (
                    <span className="card-date-badge">
                      {new Date(item.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Phóng to ảnh toàn màn hình */}
      {currentLightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Lightbox */}
            <div className="lightbox-header">
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {images.length}
              </span>
              <div className="lightbox-actions">
                <button
                  type="button"
                  className="lightbox-btn"
                  title="Tải ảnh về máy"
                  onClick={() =>
                    downloadImage(
                      currentLightboxImage.img,
                      `ky-niem-${currentLightboxImage.id || lightboxIndex + 1}.jpg`,
                    )
                  }
                >
                  ⬇️ Lưu ảnh
                </button>
                <button
                  type="button"
                  className="lightbox-btn delete"
                  title="Xóa ảnh này"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Bạn có chắc chắn muốn xóa ảnh này khỏi kho không?",
                      )
                    ) {
                      handleDeleteImage(currentLightboxImage.id);
                    }
                  }}
                >
                  🗑️ Xóa
                </button>
                <button
                  type="button"
                  className="lightbox-btn close"
                  onClick={() => setLightboxIndex(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Khung ảnh trung tâm */}
            <div className="lightbox-image-container">
              <img
                src={currentLightboxImage.img}
                alt="Ảnh phóng to"
                className="lightbox-main-img"
              />
            </div>

            {/* Nút chuyển ảnh Trước / Sau */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  title="Ảnh trước (Mũi tên trái)"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev > 0 ? prev - 1 : images.length - 1,
                    );
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  title="Ảnh sau (Mũi tên phải)"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev < images.length - 1 ? prev + 1 : 0,
                    );
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGalleryModal;
