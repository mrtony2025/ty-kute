# CƠ SỞ DỮ LIỆU SỰ KIỆN SIÊU NHIÊN (PARANORMAL EVENT DATABASE)
**Mã tài liệu**: DATA-EVT-01
**Dự án**: DƯỚI GIẾNG (Under the Well)

Tài liệu này định nghĩa cấu trúc dữ liệu sự kiện siêu nhiên (Paranormal Events) được sử dụng làm đầu vào cho `BP_ParanormalEventDirector` và `BPC_FearDirector` để kích hoạt động các tình huống kinh dị.

---

## 1. Cấu Trúc Data Table (Unreal Engine 5 Structure Compatible)

Tất cả các sự kiện được lưu trong một cấu trúc Struct `FParanormalEventRow` kế thừa từ `FTableRowBase`:

```cpp
USTRUCT(BlueprintType)
struct FParanormalEventRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FName EventID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString EventName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    EParanormalSeverity Severity; // Enum: LOW, MEDIUM, HIGH, CRITICAL

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float StressThreshold; // Ngưỡng stress tối thiểu (0-100)

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float ProbabilityWeight; // Tỷ lệ xuất hiện ngẫu nhiên

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FGameplayTagContainer RequiredNarrativeTags; // Các manh mối đã nhặt/trạng thái giải đố cần thiết

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    USoundBase* EventSound; // Âm thanh đi kèm

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    TSubclassOf<AActor> SpawnActorClass; // Lớp thực thể cần spawn (nếu có)
};
```

---

## 2. Danh Sách Sự Kiện (Event List)

### CẤP ĐỘ: THẤP (LOW SEVERITY)
*Phù hợp khi Stress từ 30% - 60%. Mang tính chất tạo bầu không khí.*

#### `EV_LOW_001`: Đèn Neon Chập Chờn (Flickering Neon)
* **Stress tối thiểu**: 30%
* **Mô tả**: Bóng đèn neon tuýp dài treo hành lang nháy đỏ rồi tắt ngóm trong 1.5 giây, đi kèm tiếng chập điện rè rè đặc trưng.
* **Tác động**: Hệ thống đèn hành lang bị gán vật lý tắt/bật đột ngột.
* **Thời gian hồi (Cooldown)**: 45 giây.

#### `EV_LOW_002`: Tiếng Thạch Sùng Kêu Đêm (Gecko Chirping)
* **Stress tối thiểu**: 35%
* **Mô tả**: Tiếng thạch sùng tặc lưỡi dồn dập trên trần nhà ẩm mốc. Tiếng động phát ra từ vị trí ngẫu nhiên phía sau đầu người chơi (3D Spatial Audio).
* **Tác động**: Âm thanh 3D chạy ngẫu nhiên trên trần phòng.
* **Thời gian hồi (Cooldown)**: 30 giây.

---

### CẤP ĐỘ: TRUNG BÌNH (MEDIUM SEVERITY)
*Phù hợp khi Stress từ 61% - 80%. Tác động trực tiếp lên giác quan người chơi.*

#### `EV_MED_001`: Loa Phường Rè Rít (Municipal Loudspeaker)
* **Stress tối thiểu**: 60%
* **Mô tả**: Chiếc loa sắt treo trên cột điện đầu ngõ phát tiếng hú rít cao tần, sau đó phát ra giọng đọc rè rè của phát thanh viên thông báo giải tỏa khu trọ cũ bị gián đoạn bởi các từ ngữ kỳ quái ("Đã đến giờ rồi... hãy xuống đây...").
* **Tác động**: Kích hoạt sound source `AmbientSound_LoaPhuong` với bộ lọc EQ Distortion.
* **Thời gian hồi (Cooldown)**: 120 giây.

#### `EV_MED_002`: Gương Trễ Nhịp (Delayed Mirror)
* **Stress tối thiểu**: 65%
* **Mô tả**: Khi người chơi đứng trước chiếc gương ố vàng trong nhà tắm trọ, bóng phản chiếu của nhân vật sẽ đứng im hoặc chậm hơn chuyển động thực tế của người chơi 1 giây.
* **Tác động**: Chuyển đổi Render Texture của gương từ thời gian thực sang ghi hình trễ (Delay Buffer).
* **Thời gian hồi (Cooldown)**: 180 giây.

#### `EV_MED_003`: Tiếng Dép Cao Su (Rubber Footsteps)
* **Stress tối thiểu**: 70%
* **Mô tả**: Tiếng bước chân đi dép cao su lê loẹt xoẹt trên sàn gạch bông cũ. Âm thanh bắt đầu ở hành lang, di chuyển dần và dừng lại ngay trước cánh cửa phòng người chơi đang đứng.
* **Tác động**: Phát chuỗi âm thanh di chuyển dọc Spline hành lang.
* **Thời gian hồi (Cooldown)**: 90 giây.

---

### CẤP ĐỘ: CAO (HIGH SEVERITY)
*Phù hợp khi Stress từ 81% - 100%. Đe dọa trực tiếp, biến dạng vật lý.*

#### `EV_HIGH_001`: Tắt Nến Bàn Thờ (Altar Candle Blowout)
* **Stress tối thiểu**: 80%
* **Yêu cầu Narrative**: Đã nhặt được manh mối `Clue_Letter_Uncle` (Thư của người bác).
* **Mô tả**: Khi người chơi vừa đọc xong bức thư, ngọn nến đỏ trên bàn thờ gỗ treo tường đột ngột vụt tắt. Có tiếng thổi phù nhẹ ngay sát tai người chơi.
* **Tác động**: Giao diện đọc thư tắt ngay lập tức, tắt PointLight màu đỏ của nến bàn thờ, kích hoạt âm thanh thở dài sau lưng.

#### `EV_HIGH_002`: Bóng Ma Góc Hành Lang (Hallway Apparition)
* **Stress tối thiểu**: 85%
* **Mô tả**: Một bóng người phụ nữ tóc dài đen tuyền mặc áo bà ba úa màu đứng im cuối hành lang mờ tối, mặt hướng vào tường. Nếu người chơi tiến lại gần hoặc rọi đèn pin thẳng vào, bóng đen sẽ tan rã thành một làn khói đen.
* **Tác động**: Spawn `BP_GhostApparition` tại điểm spawn hành lang. Bắt đầu raycast kiểm tra luồng sáng đèn pin. Nếu hit đèn pin -> trigger biến mất kèm âm thanh khói rít.

---

### CẤP ĐỘ: CỰC HẠN / KỊCH BẢN (CRITICAL / SCRIPTED)
*Chỉ kích hoạt theo kịch bản cốt truyện hoặc khi giải đố sai liên tục.*

#### `EV_CRIT_001`: Vòng Lặp Vô Tận (Infinite Loop Corridors)
* **Stress tối thiểu**: 95% hoặc khi giải sai câu đố Bàn thờ 3 lần.
* **Mô tả**: Khi bước ra khỏi phòng trọ số 4, người chơi đi dọc hành lang nhưng thấy mình liên tục quay lại cửa phòng số 4. Cảnh quan xung quanh tối sầm, các bức ảnh gia đình treo trên tường biến đổi khuôn mặt thành biến dạng rùng rợn.
* **Hóa giải**: Người chơi phải tìm nén hương giấu trong ngăn tủ, thắp lên bàn thờ hành lang để phá vỡ ảo giác (Phá vỡ vòng lặp không gian).

#### `EV_CRIT_002`: Giếng Trào Nước Đen (The Well Overflow)
* **Stress tối thiểu**: Chỉ kích hoạt ở Phase cuối (Cảnh kết thúc).
* **Mô tả**: Giếng bê tông ở sân giữa nứt toác, nước bùn đen ngòm cùng những lọn tóc dài trào ra lê láng khắp sân. Bàn tay của Oán Linh trồi lên bấu chặt miệng giếng. Người chơi phải chạy thật nhanh vào phòng số 1 để tìm cát hóa giải hoặc sẽ bị kéo xuống đáy giếng.
