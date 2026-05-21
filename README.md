# VIETNAM HORROR AI GAME FACTORY - DƯỚI GIẾNG (UNDER THE WELL)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Engine: Unreal Engine 5.4](https://img.shields.io/badge/Engine-Unreal_Engine_5.4-black.svg?logo=unrealengine&logoColor=white)](https://www.unrealengine.com/)
[![Web: Vanilla JS / Express](https://img.shields.io/badge/Web-Vanilla_JS_/_Express-blue.svg?logo=javascript&logoColor=white)](https://nodejs.org/)

Một dự án thiết kế game kinh dị urban/folklore Việt Nam thế hệ mới, tái hiện bầu không khí u tối, ngột ngạt của những dãy nhà trọ cũ kỹ Hà Nội. Dự án kết hợp công cụ quản lý thiết kế thông minh (AI-assisted web dashboard) và hệ thống mã nguồn C++ Unreal Engine 5.4 tối ưu.

---

## 🌌 1. Tổng Quan Dự Án & Bối Cảnh (Project Overview)

**"DƯỚI GIẾNG"** đưa người chơi vào vai **Minh** - một chàng sinh viên tỉnh lẻ vừa dọn đến dãy nhà trọ cũ. Sự tò mò tai hại khi soi đèn xuống chiếc giếng bê tông rêu phong phủ đầy bùa yểm sau nhà đã đánh thức một oán linh bị xiềng xích sâu dưới đáy nước lạnh lẽo. Trò chơi khai thác sâu tâm lý sợ hãi bản địa Việt Nam, sử dụng các hình tượng văn hóa quen thuộc:
* **Bát hương tro nguội & Ban thờ gỗ treo tường** chăng chịt chỉ đỏ phong ấn.
* **Búp bê gỗ chú Tễu** với nụ cười đông cứng rợn tóc gáy.
* **Chiếc radio sóng ngắn AM** rè rít phát ra tần số tâm linh `108 KHz`.
* **Loa phường Hà Nội cổ** biến dạng tần số theo cấp độ stress của nhân vật.

---

## 🛠️ 2. Thành Phần Cấu Trúc Hệ Thống (System Components)

Dự án được thiết kế song song 2 mảng chính:

### A. Web Developer Dashboard (Fullstack Node.js & Express)
* **REST API**: Đồng bộ dữ liệu sự kiện siêu nhiên (`data/events.json`) và bộ thư viện prompt mẫu cho AI Studio (`data/prompts.json`).
* **Web Audio DSP Synthesizer**: Giả lập âm thanh tiếng rè tivi CRT, loa phường nhiễu sóng AM theo thời gian thực dựa trên các bộ lọc tần số (Web Audio API).
* **Minigame Demo Tương Tác (Tab 7)**: Bản thử nghiệm logic trực quan ngay trên trình duyệt bao gồm:
  - Cơ chế cạn kiệt pin đèn pin và tích lũy stress trong bóng tối (+2.5%/giây).
  - Soi đèn pin động dạng Spotlight Masking dùng CSS radial-gradient bám vị trí chuột.
  - Xoay đồ vật 3D (Ấm trà cổ) để tìm manh mối mã số `108`.
  - 3 Ending phân nhánh (Hóa Giải, Chìm Sâu, Sự Thật Kinh Hoàng).
* **Concept Art Showcase**: Trực quan hóa tạo hình nhân vật và ban thờ gỗ yểm chỉ đỏ phong ấn.

### B. Unreal Engine 5.4 C++ Modules (`Systems/UE5Modules/`)
Mã nguồn C++ tối ưu hóa cho các cơ chế cốt lõi trong Unreal Engine:
* `BPC_FearDirector`: Thành phần Actor Component quản lý nhịp độ kinh dị, tự động theo dõi stress level người chơi dựa trên khoảng cách với bóng ma, mức độ tối sáng và broadcast oán khí bằng Event Dispatchers.
* `BPC_InspectionComponent`: Bộ điều khiển raycast bắt hotspot tương tác (`ClueHotspot`) khi cầm nắm xoay vật phẩm 3D, hỗ trợ tạm dừng di chuyển người chơi.
* `APuzzleBase`: Lớp cơ sở cho các câu đố trong môi trường, ràng buộc hình phạt tích lũy stress trực tiếp vào Fear Director khi người chơi nhập sai mật mã.

---

## ⚡ 3. Hướng Dẫn Cài Đặt & Khởi Chạy (Installation & Usage)

### Yêu cầu hệ thống:
* **Node.js** phiên bản v18 trở lên.
* Trình duyệt web hiện đại hỗ trợ **Web Audio API** (Chrome, Edge, Firefox, Safari).

### Các bước chạy Dashboard cục bộ:
1. Di chuyển vào thư mục dự án và cài đặt dependencies:
   ```bash
   npm install
   ```
2. Khởi chạy Server ở chế độ phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt và truy cập:
   * Dashboard: [http://localhost:4000/](http://localhost:4000/)
   * API Sự kiện siêu nhiên: [http://localhost:4000/api/events](http://localhost:4000/api/events)
   * API Prompts: [http://localhost:4000/api/prompts](http://localhost:4000/api/prompts)

---

## 📦 4. Công Cụ Triển Khai Sang Unreal Engine 5 (UE5 Deployment Tool)

Dự án tích hợp một script tự động chuyển đổi và sao chép mã nguồn C++ sang thư mục dự án Unreal Engine của bạn:
```bash
npm run deploy-ue5
```
* **Tính năng**: 
  - Quét tên project từ file `.uproject` của bạn.
  - Tự động thay thế Macro API xuất khẩu (ví dụ: đổi `TYKUTE_API` thành `<TEN_DỰ_ÁN>_API` chuẩn C++ Unreal).
  - Tự động bỏ qua các file Resource Forks ẩn của macOS (`._*`) để tránh lỗi nhận diện sai tên thư mục.

---

## 🔒 5. Bảo Mật & Đóng Gói (Security & Git Policy)

* File `node_modules/`, các file log `*.log`, thư mục giả lập `scratch/` và các file cấu hình chứa token (`.env`, `.evn`) được cấu hình bỏ qua nghiêm ngặt trong `.gitignore`.
* **Tuyệt đối không push các file chứa token lên kho Git công khai.**

---

## 📄 6. Bản Quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**. Bạn có thể tự do chỉnh sửa và tích hợp vào các dự án thương mại khác.
