# BẢN MẪU THIẾT KẾ BLUEPRINT UE5 (UE5 BLUEPRINT TEMPLATES)
**Mã tài liệu**: BP-TMPL-01
**Dự án**: Vietnam Horror AI Game Factory

Tài liệu này cung cấp sơ đồ cấu trúc lớp (Class Structure), định nghĩa biến, hàm và giả mã thuật toán (Pseudocode) cho các Blueprint Component cốt lõi trong Unreal Engine 5.4 để làm tài liệu tham chiếu nhập trực tiếp vào AI Studio / Cursor.

---

## 1. BPC_FearDirector (Actor Component)
*Component quản lý stress của người chơi và trigger các sự kiện siêu nhiên.*

### A. Định nghĩa Biến (Variables)
* `PlayerStress` (Float, ReadOnly): Mức độ stress hiện tại (0.0 - 100.0).
* `IsInDarkness` (Boolean, BlueprintReadOnly): Người chơi có đang ở trong bóng tối không.
* `CooldownActive` (Boolean, Private): Đang trong thời gian hồi dọa.
* `ActiveSeverity` (EParanormalSeverity, Private): Mức độ sự kiện đang hoạt động.
* `DirectorTimerHandle` (TimerHandle, Private): Quản lý luồng lặp tính stress mỗi giây.

### B. Event Graph & Functions (Giả mã logic)

```python
# Gọi tại Event BeginPlay
def BeginPlay():
    # Khởi chạy vòng lặp tính stress mỗi 1.0 giây thay vì sử dụng Event Tick
    GetWorldTimerManager().SetTimer(DirectorTimerHandle, EvaluateStressAndEvents, 1.0, True)

# Hàm đánh giá stress và quyết định scare event
def EvaluateStressAndEvents():
    if CooldownActive:
        # Nếu đang cooldown, giảm stress chậm
        PlayerStress = Max(0.0, PlayerStress - 0.2)
        return
        
    # Tính toán stress tăng thêm
    stress_gain = 0.0
    if IsInDarkness:
        stress_gain += 1.5
        
    distance_to_ghost = GetDistanceToGhost()
    if distance_to_ghost < 500.0: # 5 mét
        stress_gain += 5.0
    elif distance_to_ghost < 1500.0: # 15 mét
        stress_gain += 2.0
        
    # Nếu không có yếu tố làm stress tăng, tự động giảm stress nhẹ
    if stress_gain == 0.0:
        PlayerStress = Max(0.0, PlayerStress - 0.5)
    else:
        PlayerStress = Min(100.0, PlayerStress + stress_gain)
        
    # Đánh giá kích hoạt sự kiện siêu nhiên
    EvaluateParanormalTrigger()

# Hàm kích hoạt sự kiện tâm linh dựa trên xác suất
def EvaluateParanormalTrigger():
    if PlayerStress < 30.0 or CooldownActive:
        return
        
    # Xác định mức độ nghiêm trọng dựa trên Stress Level
    severity = EParanormalSeverity.LOW
    if PlayerStress > 80.0:
        severity = EParanormalSeverity.HIGH
    elif PlayerStress > 60.0:
        severity = EParanormalSeverity.MEDIUM
        
    # Tạo xác suất ngẫu nhiên để kích hoạt (Ví dụ: 25% cơ hội mỗi giây khi đủ điều kiện)
    roll = RandomFloatInRange(0.0, 100.0)
    if roll < 25.0:
        TriggerScareEvent(severity)

# Kích hoạt sự kiện và gọi Dispatcher
def TriggerScareEvent(severity: EParanormalSeverity):
    CooldownActive = True
    # Gọi Event Dispatcher để Level Blueprint hoặc Sound/Light Manager bắt sự kiện
    OnScareEventTriggered.Broadcast(severity)
    
    # Thiết lập Timer để tắt Cooldown sau 30 giây
    GetWorldTimerManager().SetTimer(CooldownTimerHandle, ClearCooldown, 30.0, False)

def ClearCooldown():
    CooldownActive = False
```

---

## 2. BPC_InspectionComponent (Actor Component)
*Component gắn vào Player Character để xử lý cơ chế cầm nắm, xoay 3D đồ vật tìm manh mối.*

### A. Định nghĩa Biến (Variables)
* `IsInspecting` (Boolean): Đang trong chế độ soi đồ vật.
* `InspectedActor` (AActor Reference): Actor đang được soi.
* `OriginalTransform` (Transform): Tọa độ và xoay gốc của vật thể để hoàn trả khi thoát.
* `RotationSpeed` (Float, Default 2.0): Tốc độ xoay vật thể bằng chuột.
* `InspectionDistance` (Float, Default 40.0): Khoảng cách từ camera đến vật thể khi soi.

### B. Event Graph & Functions (Giả mã logic)

```python
# Gọi khi người chơi nhấn nút Tương Tác (E) vào vật thể có tag "Inspectable"
def StartInspection(TargetActor: AActor):
    if IsInspecting: return
    
    IsInspecting = True
    InspectedActor = TargetActor
    OriginalTransform = TargetActor.GetActorTransform()
    
    # 1. Tắt di chuyển và điều hướng camera của Player
    PlayerController = GetPlayerController()
    PlayerController.SetInputMode(FInputModeGameAndUI())
    PlayerController.bShowMouseCursor = False
    GetCharacterMovement().DisableMovement()
    
    # 2. Di chuyển vật phẩm về trước Camera (Inspection Anchor)
    # Sử dụng Timeline hoặc FInterpTo để di chuyển mượt mà
    TargetLocation = Camera.GetWorldLocation() + (Camera.GetForwardVector() * InspectionDistance)
    InspectedActor.SetActorLocationAndRotation(TargetLocation, Camera.GetActorRotation())
    
    # Tắt vật lý vật thể tạm thời để tránh va chạm lỗi
    InspectedActor.SetActorEnableCollision(False)

# Gọi mỗi khi người chơi di chuyển chuột trái kéo (Drag)
def UpdateInspectionRotation(AxisX: float, AxisY: float):
    if not IsInspecting or not IsValid(InspectedActor): return
    
    # Tính toán vector xoay cục bộ dựa trên di chuyển chuột
    # Tránh xoay theo trục thế giới (World Space) để người chơi dễ quan sát
    camera_right = Camera.GetRightVector()
    camera_up = Camera.GetUpVector()
    
    InspectedActor.AddActorWorldRotation(FRotator(AxisY * RotationSpeed, -AxisX * RotationSpeed, 0.0))
    
    # Kiểm tra Raycast Hotspot xem người chơi có đang nhìn trúng manh mối ẩn không
    CheckClueHotspot()

# Quét Raycast từ tâm camera để tìm Hotspot
def CheckClueHotspot():
    start_loc = Camera.GetWorldLocation()
    end_loc = start_loc + (Camera.GetForwardVector() * (InspectionDistance + 20.0))
    
    hit_result = LineTraceSingleForObjects(start_loc, end_loc, CollisionObjectTypeQuery_Clue)
    if hit_result.bBlockingHit:
        # Nếu trúng collider đặc biệt chứa thông tin manh mối
        clue_actor = CastToClueBase(hit_result.GetActor())
        if clue_actor:
            # Phát hiện manh mối! Gửi tag qua Narrative Tracker
            NarrativeTracker.DiscoverClue(clue_actor.ClueID)

# Thoát chế độ soi đồ
def StopInspection():
    if not IsInspecting: return
    
    # Khôi phục trạng thái ban đầu của vật thể và nhân vật
    InspectedActor.SetActorTransform(OriginalTransform)
    InspectedActor.SetActorEnableCollision(True)
    
    PlayerController = GetPlayerController()
    PlayerController.SetInputMode(FInputModeGameOnly())
    GetCharacterMovement().SetMovementMode(MOVE_Walking)
    
    IsInspecting = False
    InspectedActor = None
```

---

## 3. BP_PuzzleBase (Actor Base Class)
*Lớp cơ sở cho các câu đố trong game (như xoay núm radio, sắp xếp bàn thờ).*

### A. Định nghĩa Biến (Variables)
* `PuzzleState` (EPuzzleState): Trạng thái câu đố (Locked, Active, Solved).
* `RequiredClues` (Array of FName): Danh sách mã manh mối cần thu thập trước mới cho phép giải đố.
* `MaxAttempts` (Integer, Default 3): Số lần thử tối đa trước khi bị trừng phạt gắt.
* `CurrentFailedAttempts` (Integer): Số lần nhập sai hiện tại.

### B. Event Graph & Functions (Giả mã logic)

```python
# Gọi khi người chơi kích hoạt tương tác câu đố
def InteractWithPuzzle(PlayerChar: ACharacter):
    # Kiểm tra xem người chơi đã có đủ manh mối mở khóa câu đố chưa
    if not NarrativeTracker.HasClues(RequiredClues):
        ShowSubtitle("Tôi chưa hiểu quy luật của thứ này...")
        PlaySound(SND_Interact_Locked)
        return
        
    PuzzleState = EPuzzleState.ActiveInUI
    OpenPuzzleUIWidget() # Hiển thị UI giải đố (Xoay radio, nhập mã...)

# Hàm xử lý kết quả khi người chơi nhấn nút xác nhận trong UI giải đố
def SubmitSolution(SolutionData: FString):
    if CheckSolutionCorrect(SolutionData):
        SolvePuzzle()
    else:
        FailPuzzleAttempt()

def SolvePuzzle():
    PuzzleState = EPuzzleState.Solved
    ClosePuzzleUIWidget()
    PlaySound(SND_Puzzle_Solved)
    
    # Mở cửa hoặc kích hoạt nguồn điện
    OnPuzzleSolved.Broadcast()
    
    # Ghi nhận vào Narrative Tracker để mở khóa luồng cốt truyện tiếp theo
    NarrativeTracker.MarkPuzzleCompleted(PuzzleID)

def FailPuzzleAttempt():
    CurrentFailedAttempts += 1
    PlaySound(SND_Puzzle_Wrong)
    
    # Trừng phạt qua Fear Director: Tăng stress lập tức
    FearDirector.AddStressInstant(15.0)
    
    # Phát sự kiện dọa ngẫu nhiên tăng áp lực tâm lý
    OnPuzzleFailurePenalty.Broadcast(CurrentFailedAttempts)
    
    if CurrentFailedAttempts >= MaxAttempts:
        # Nếu sai quá số lần, tự động đóng UI giải đố, cưỡng chế người chơi đối diện nguy hiểm
        ClosePuzzleUIWidget()
        FearDirector.TriggerScareEvent(EParanormalSeverity.HIGH)
        CurrentFailedAttempts = 0 # Reset số lần thử
```
