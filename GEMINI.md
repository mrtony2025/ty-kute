# GEMINI AI AGENT INSTRUCTION & ARCHITECTURE (GEMINI.md)

[![Agent: Antigravity](https://img.shields.io/badge/Agent-Antigravity_Gemini-orange.svg?logo=google&logoColor=white)](https://deepmind.google/)

Tài liệu này hướng dẫn cách cộng tác, vận hành và khai thác sức mạnh của tác nhân AI **Antigravity (Gemini)** trong dự án thiết kế game **DƯỚI GIẾNG**.

---

## 🤖 1. Vai Trò Của Gemini Agent (Agent Role)

Trong dự án này, Gemini hoạt động dưới vai trò **Lead Technical Partner & Systems Designer**, hỗ trợ nhà phát triển thực hiện các tác vụ:
1. **Thiết kế Cốt truyện & Hệ thống Gameplay**: Xây dựng kịch bản, 3 kết thúc phân nhánh và dữ liệu sự kiện siêu nhiên Việt Nam.
2. **Lập trình C++ Unreal Engine 5.4**: Tạo cấu trúc Blueprint giả lập và viết mã nguồn C++ chuẩn hóa hiệu năng cho các thành phần cốt lõi.
3. **Phát triển Fullstack Web Dashboard**: Thiết kế giao diện Glassmorphism và tối ưu hóa bộ tổng hợp âm thanh Web Audio API DSP.
4. **Kiểm toán & Vá lỗi (Auditing & Debugging)**: Rà soát cú pháp code tĩnh (`node -c`), phát hiện rò rỉ bộ nhớ Audio và đảm bảo an toàn bảo mật repo Git.

---

## 🧠 2. Trợ Lý Cục Bộ Biên: Gemini Nano Banana Concept

Dự án giới thiệu ý tưởng thiết kế tích hợp **Gemini Nano Banana (Edge AI Assistant)**:
* **Mục tiêu**: Một mô hình ngôn ngữ lớn siêu nhẹ (SLM) chạy ngầm trực tiếp ở biên trên máy người chơi để giám sát nhịp tim/stress level người chơi thời gian thực và cung cấp gợi ý/điều chỉnh động nhịp độ hù dọa (Dynamic Jumpscare Scaling).
* **Giao diện Trực quan**: Trợ lý Banana được thiết kế với phong cách viễn tưởng - kính VR visor phát sáng vàng neon, tạo sự tương phản nghệ thuật cao trên nền bảng điều khiển u tối của Dashboard.

---

## 📚 3. Thư Viện Prompt Mẫu Cho AI Studio (`AI/PromptLibrary/Horror/`)

Để tái sử dụng năng lực của Gemini cho việc mở rộng dự án trên Unreal Engine, hãy sử dụng 3 Prompt đặc thù được cấu trúc tại thư mục [AI/PromptLibrary/Horror/AIHorrorPromptLibrary.md](file:///Volumes/SSD BIG/Project/DICH VU KH 2026/TVT AGENCY/Antigravity/06_TOOLS/ty-kute/AI/PromptLibrary/Horror/AIHorrorPromptLibrary.md):

* **Prompt 1 (Fear Director)**: Chuyên sinh mã logic C++ Actor Component quản lý stress dựa trên khoảng cách quái vật và các yếu tố môi trường.
* **Prompt 2 (Inspection System)**: Sinh code cho cơ chế xoay vật phẩm 3D, chiếu tia Raycast tìm Hotspot manh mối.
* **Prompt 3 (Environment Puzzle)**: Thiết lập lớp cha PuzzleBase quản lý logic khóa số, âm thanh mở/khóa và hình phạt tăng stress khi giải sai.

---

## ⚙️ 4. Quy Trình Vận Hành Của Agent (Agent Workflow)

Khi yêu cầu Gemini Agent nâng cấp hoặc kiểm tra dự án, Agent sẽ tự động tuân thủ quy trình 5 bước sau:
1. **Research (Nghiên cứu)**: Quét codebase để hiểu rõ sự phụ thuộc (dependencies) và cấu trúc hiện tại.
2. **Plan (Lên kế hoạch)**: Tạo tệp `implementation_plan.md` trong thư mục brain để ghi nhận thay đổi dự kiến và xin ý kiến phê duyệt từ User.
3. **Execute (Thực thi)**: Thực hiện sửa code theo các khối nhỏ, sử dụng checklist `task.md` để tự theo dõi tiến độ.
4. **Verify (Xác minh)**: Chạy lệnh build, kiểm tra lỗi cú pháp và chạy thử server Express để đảm bảo không lỗi runtime.
5. **Walkthrough (Tổng kết)**: Ghi lại toàn bộ thay đổi, cập nhật tài liệu `walkthrough.md` kèm theo đường dẫn file liên kết cụ thể.
