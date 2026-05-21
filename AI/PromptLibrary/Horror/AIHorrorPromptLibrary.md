# THƯ VIỆN PROMPT AI KINH DỊ CHO AI STUDIO (HORROR PROMPT LIBRARY)
**Mã tài liệu**: AI-PRMPT-HORROR-01
**Dự án**: Vietnam Horror AI Game Factory

Thư viện này chứa các Prompt chuyên dụng được định dạng sẵn để gửi vào **AI Studio**, **Cursor**, hoặc **Claude Code** để sinh ra mã nguồn C++ hoặc cấu trúc logic Blueprint sạch, tối ưu hóa cho các hệ thống game kinh dị.

---

## PROMPT 1: Fear Director System Generator
*Sử dụng khi bạn muốn tạo logic cốt lõi điều phối nỗi sợ động.*

```text
You are a Lead Gameplay Engineer for Unreal Engine 5.4 specializing in psychological horror mechanics.

GOAL:
Generate the architecture and logic for a component-based "Fear Director System" (BPC_FearDirector) that dynamically drives game tension based on player parameters.

CONSTRAINTS:
- Unreal Engine 5.4 compatible.
- Clean Blueprint-friendly structure (Blueprintable Actor Component).
- Highly optimized: No heavy computations inside Tick. Use a timer-based system (e.g., updates every 1.0 second).
- Event-driven: Expose Dispatchers/Events for Sound, Lighting, and Entity managers.
- No multiplayer code.

INPUT VARIABLES TO TRACK:
- PlayerStressLevel (Float, 0.0 to 100.0)
- IsInDarkness (Boolean)
- DistanceToEntity (Float)
- CooldownTimerActive (Boolean)
- CooldownDuration (Float, default 30.0s)

FUNCTIONALITY REQUIRED:
1. Dynamic Stress Calculation:
   - Increment stress by +1.5/sec in dark.
   - Increment stress by +5.0/sec if distance < 500 units, +2.0/sec if distance < 1500 units.
   - Decay stress by -0.5/sec if in light and no entity nearby.
   - Expose an public function: "AddStressInstant(float Amount)" for puzzle failures.
2. Event Evaluation (Timer run every 1 second):
   - If Stress > 30, evaluate random paranormal events using dynamic probability weighting.
   - If an event is triggered, fire "OnScareEventTriggered(EParanormalSeverity Severity)" and start CooldownTimer.
   - While CooldownTimer is active, reduce stress accumulation rate to 20%.

OUTPUT:
Please generate:
1. Exact Blueprint Variable declarations (Name, Type, Default Value).
2. Blueprint Function signatures and their step-by-step logic in pseudo-code.
3. Event Dispatchers to create.
4. C++ Equivalent code (.h and .cpp) if we decide to implement in C++.
```

---

## PROMPT 2: 3D Clue Inspection Component Generator
*Sử dụng để sinh code xử lý việc xoay/zoom vật phẩm 3D và tìm manh mối ẩn.*

```text
You are a Senior UE5 Developer. We need an Actor Component called "BPC_InspectionComponent" that handles 3D object investigation inside a first-person horror game.

GOAL:
Write the interaction logic allowing the player to look at an item, pick it up into a private 3D inspection view, rotate it, detect hidden details, and store clue data.

CONSTRAINTS:
- First-Person perspective.
- Temporarily disables Player Locomotion and Input Yaw/Pitch during inspection.
- Interpolates the object smoothly from its world position to an inspection anchor point in front of the camera (using FInterpTo).

REQUIRED FEATURES:
1. EnableInspectMode(AStaticMeshActor* TargetItem):
   - Stores original transform.
   - Attaches item to a SceneComponent (InspectionAnchor) attached to Player Camera.
   - Switches Input Mode to UI/Game and routes mouse drag inputs to RotateActorLocal.
2. RotateObject(float AxisX, float AxisY):
   - Adds local rotation to the inspected actor.
3. Raycast Hotspot Detection:
   - Perform a line trace from the camera straight forward relative to the item space.
   - If tracing hits a specific Collision Box component on the item marked "Hotspot_Clue", trigger "OnClueDiscovered(FName ClueID)".
4. DisableInspectMode():
   - Detaches item and returns it to its original world position or hides it if consumed.
   - Restores Player input and locomotion.

OUTPUT:
1. Variables needed (including camera references, rotation speeds, interpolation speeds).
2. Detailed pseudocode for Yaw/Pitch mapping to local actor rotation.
3. Clean C++ code for BPC_InspectionComponent (.h and .cpp) with UPROPERTY and UFUNCTION properly exposed.
```

---

## PROMPT 3: Puzzle State Machine & Penalty Event Integrator
*Sử dụng để tạo logic kết nối các câu đố và trừng phạt người chơi bằng sự kiện kinh dị.*

```text
You are a Systems Designer and Programmer. Generate a modular "BP_PuzzleBase" class and "BP_PuzzleManager" for a horror environment.

GOAL:
Build a puzzle system that manages puzzle states (Locked, Active, Solved, Failed) and connects directly to the Fear Director for penalty events.

REQUIREMENTS:
1. State Management:
   - Enum: EPuzzleState (Locked, ReadyToInteract, ActiveInUI, Solved, Failed).
   - Array of ClueIDs required to unlock the puzzle (Check against NarrativeTracker).
2. Interaction:
   - When interacted, transition to ActiveInUI. Show Custom UI Widget.
   - Keep game running in background (Do not pause game, play ambient sound).
3. Failure & Stress Penalty Loop:
   - Expose a limit "MaxAttempts" (default 3) and variable "CurrentFailedAttempts".
   - If player inputs wrong answer, increment CurrentFailedAttempts.
   - Call BPC_FearDirector -> AddStressInstant(15.0).
   - Trigger a custom dispatcher "OnPuzzleFailurePenalty" with severity HIGH, allowing the Level Script to play immediate scares (e.g. lights turn off, loud bang at the door).
4. Victory Condition:
   - Transition to Solved. Trigger "OnPuzzleSolved". Update NarrativeTracker with completed puzzle ID.

OUTPUT:
Provide the Blueprint flow layout, variables, events, and functions. Provide optimization tips for UI Widget binding to avoid Ticking checks.
```
