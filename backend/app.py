import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env"
    )

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB limit for image uploads
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Backend Flask đang chạy!",
        "supabase": "Đã kết nối"
    })


@app.route("/api/test")
def test_api():
    return jsonify({
        "message": "Frontend đã kết nối Backend thành công!"
    })


@app.route("/api/verify-password", methods=["POST"])
def verify_password():
    payload = request.get_json(silent=True) or {}
    submitted_password = str(payload.get("password", ""))

    if len(submitted_password) != 8 or not submitted_password.isdigit():
        return jsonify({"valid": False, "message": "Mật khẩu phải gồm 8 chữ số."}), 400

    try:
        result = (
            supabase.table("password")
            .select("password")
            .limit(1)
            .execute()
        )
        if not result.data:
            app.logger.error(
                "Không đọc được mật khẩu từ bảng password. "
                "Kiểm tra dữ liệu hoặc RLS policy của Supabase."
            )
            return jsonify({
                "valid": False,
                "message": "Máy chủ chưa có cấu hình mật khẩu."
            }), 500

        saved_password = result.data[0].get("password")
        is_valid = (
            saved_password is not None
            and submitted_password == str(saved_password).strip()
        )
    except Exception:
        app.logger.exception("Không thể kiểm tra mật khẩu từ Supabase")
        return jsonify({"valid": False, "message": "Không thể kết nối máy chủ."}), 500

    if not is_valid:
        return jsonify({"valid": False, "message": "Mật khẩu không đúng."}), 401

    return jsonify({"valid": True})


# =========================================
# QUẢN LÝ KHO ẢNH (IMAGES API)
# =========================================

@app.route("/api/images", methods=["GET"])
def get_images():
    try:
        result = (
            supabase.table("images")
            .select("*")
            .order("id", desc=True)
            .execute()
        )
        return jsonify({
            "success": True,
            "images": result.data or []
        })
    except Exception:
        app.logger.exception("Không thể lấy danh sách ảnh từ Supabase")
        return jsonify({
            "success": False,
            "message": "Không thể tải danh sách ảnh từ máy chủ."
        }), 500


@app.route("/api/images", methods=["POST"])
def add_image():
    payload = request.get_json(silent=True) or {}
    img_data = payload.get("img", "").strip()

    if not img_data:
        return jsonify({
            "success": False,
            "message": "Dữ liệu ảnh không được để trống."
        }), 400

    try:
        result = (
            supabase.table("images")
            .insert({"img": img_data})
            .execute()
        )
        if not result.data:
            return jsonify({
                "success": False,
                "message": "Không thể lưu ảnh vào cơ sở dữ liệu."
            }), 500

        return jsonify({
            "success": True,
            "image": result.data[0]
        }), 201
    except Exception:
        app.logger.exception("Không thể thêm ảnh vào Supabase")
        return jsonify({
            "success": False,
            "message": "Không thể lưu ảnh lên máy chủ."
        }), 500


@app.route("/api/images/<int:image_id>", methods=["DELETE"])
def delete_image(image_id):
    try:
        result = (
            supabase.table("images")
            .delete()
            .eq("id", image_id)
            .execute()
        )
        return jsonify({
            "success": True,
            "message": "Đã xóa ảnh thành công.",
            "deleted": result.data or []
        })
    except Exception:
        app.logger.exception(f"Không thể xóa ảnh ID {image_id}")
        return jsonify({
            "success": False,
            "message": "Không thể xóa ảnh khỏi máy chủ."
        }), 500


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )