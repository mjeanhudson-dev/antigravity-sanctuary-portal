# Global Multi-Agent Knowledge Index & Domain Overlay Catalog
**Cross-Project Reusable Research, Mathematical Models, Hardware Protocols & Code Artifacts**

> [!IMPORTANT]
> **PURPOSE:**
> When multiple agents work across different projects (e.g. racing simulators, flight models, VR motion tracking, HID proxies, game mods), they must not waste tokens re-researching or re-implementing solved technical problems.
> 
> This catalog indexes production-grade, mathematically verified algorithms and hardware protocols available across the Antigravity ecosystem for immediate reuse.

---

## 1. Catalog of Reusable Core Domains

### 1.1 DualSense USB HID Communication Protocol (`#hardware-hid-dualsense`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp), [`gyro_workshop.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/gyro_workshop.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Any project requiring direct, low-latency, zero-driver DualSense v1 (`0x054C:0x0CE6`) or v2 (`0x054C:0x0DF2`) communication on Windows.

#### Technical Specifications:
- **Win32 SetupAPI GUID:** `{4D1E55B2-F16F-11CF-88CB-001111000030}` (Device interface HID class).
- **Asynchronous Overlapped I/O:** Opened via `CreateFileA` with `FILE_FLAG_OVERLAPPED`, polled in a dedicated high-priority Win32 thread at 250 Hz (4 ms poll interval).
- **USB Input Report 0x01 (64 bytes):**
  - Pedals: L2 `d[4]`, R2 `d[5]` (8-bit $0-255$).
  - Face Buttons: Cross `d[8] & 0x20`, Square `d[8] & 0x10`, Circle `d[8] & 0x40`, Triangle `d[8] & 0x80`.
  - D-Pad: `d[8] & 0x0F` (8 directions + centered).
  - Special Buttons: L3 `d[9] & 0x40`, R3 `d[9] & 0x80`, PS `d[10] & 0x01`, Touch Click `d[10] & 0x02`, Mute `d[10] & 0x04`.
  - Gyroscope (16-bit LE, $\pm 2000^\circ/\text{s}$, $16.4\text{ LSB} / (^\circ/\text{s})$): Gyro X `d[15..16]`, Gyro Y `d[17..18]`, Gyro Z `d[19..20]`.
  - Accelerometer (16-bit LE, $\pm 4g$, $8192\text{ LSB} / g$): Accel X `d[21..22]`, Accel Y `d[23..24]`, Accel Z `d[25..26]`.
  - Touchpad (Capacitive): Contact 1 `d[32..35]` (Touch ID, touch inactive flag `0x80`, 12-bit $X \in [0, 1920]$, 12-bit $Y \in [0, 1080]$).
- **USB Output Report 0x02 (64 bytes):**
  - Flags: Byte 1 `0xFF`, Byte 2 `0xF7`.
  - Motors: Byte 3 (Right high-freq motor $0-255$), Byte 4 (Left low-freq motor $0-255$).
  - Adaptive Triggers: Byte 11 (Right Mode), Bytes 12-13 (Right Params), Byte 22 (Left Mode), Bytes 23-24 (Left Params).
    - Mode `0x00`: Off / unpowered.
    - Mode `0x05`: Soft stock spring resistance.
    - Mode `0x21`: Constant static resistance force.
    - Mode `0x26`: Active frequency vibration (Byte 12 = frequency Hz, Byte 13 = amplitude force).
  - RGB Lightbar: Byte 45 (Red), Byte 46 (Green), Byte 47 (Blue).

---

### 1.2 1st-Party Unified Player Turn & Lean Architecture (`#smoothstep-blending`, `#motion-imu-fusion`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp), [`SHARED_REPOSITORY.md`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/SHARED_REPOSITORY.md#L26-L54)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Gyro steering in racing simulators, flight roll/yaw controls, camera tilt/pan fusion.

#### Mathematical Foundation:
1. **Normalized Sagittal Gravity:**
   $$g_{yz} = \max\left(\sqrt{a_y^2 + a_z^2}, 100.0\right),\quad n_y = \frac{a_y}{g_{yz}},\quad n_z = \frac{a_z}{g_{yz}}$$
2. **Sagittal Roll Rate (Wheel Turning Upright, Banking Handles on Lap):**
   $$\omega_{\text{roll}} = -\left(\text{rateZ} \cdot n_y + \text{rateY} \cdot n_z\right)$$
3. **Face / Turntable Rate (Wheel Turning Upright, Turntable on Lap):**
   $$\omega_{\text{turn}} = -\text{rateZ}$$
4. **Power Weighting Ratio ($u$):**
   $$u = \frac{\omega_{\text{roll}}^2}{\omega_{\text{roll}}^2 + \omega_{\text{turn}}^2 + 10^{-6}}$$
5. **Ken Perlin's $C^2$ Smootherstep Blend ($s(u)$):**
   $$s(u) = u^3 \left(10 - 15u + 6u^2\right)$$
   $$\omega_{\text{fused}} = s(u) \cdot \omega_{\text{roll}} + (1 - s(u)) \cdot \omega_{\text{turn}}$$
6. **Properties:**
   - Upright wheel steering: $n_y = 1, n_z = 0 \implies \omega_{\text{roll}} \equiv \omega_{\text{turn}} \equiv -\text{rateZ}$. $u = 0.5 \implies s(u) = 0.5 \implies$ Identical 1:1 wheel steering.
   - Flat on lap lean: $\omega_{\text{roll}} = -\text{rateY}, \omega_{\text{turn}} = 0 \implies u = 1 \implies s(u) = 1 \implies$ 100% banking.
   - Flat on lap turn: $\omega_{\text{turn}} = -\text{rateZ}, \omega_{\text{roll}} = 0 \implies u = 0 \implies s(u) = 0 \implies$ 100% turntable.
   - $C^2$ continuity: $s'(0) = s'(1) = 0$ and $s''(0) = s''(1) = 0$. Eliminates cutoff cliffs, hitching, and cancellation.

---

### 1.3 Rate-Driven Casiez 1€ Filter (`#casiez-1euro-filter`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Any IMU-based motion tracking system needing jitter suppression at rest while maintaining sub-3ms latency during fast gestures.

#### Mathematical Foundation:
- Traditional 1€ filters differentiate noisy position signals to estimate velocity.
- Rate-driven variant takes physical angular velocity $\omega_{\text{roll}}$ measured directly at 250 Hz:
  $$f_c = f_{c,\min} + \beta |\omega_{\text{roll}}|$$
  $$\alpha = \frac{2 \pi f_c \Delta t}{1 + 2 \pi f_c \Delta t}$$
  $$\hat{\theta}_k = \text{Wrap}\left(\hat{\theta}_{k-1} + \alpha \text{Wrap}(\theta_k - \hat{\theta}_{k-1})\right)$$
- Angle wrapping handles branch-cut transitions smoothly:
  $$\text{Wrap}(\phi) = \phi - 360^\circ \times \text{round}(\phi / 360^\circ)$$
- **Default Parameters:** $f_{c,\min} = 1.20\text{ Hz}$, $\beta = 0.040$. Clamps resting jitter to $\sigma < 0.03^\circ$, with latency dropping to $<2.5\text{ ms}$ under fast counter-steering ($f_c > 17\text{ Hz}$).

---

### 1.4 Dynamic Complementary Sensor Fusion & Recline/Lap Immunity (`#motion-imu-fusion`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** IMU orientation estimation without magnetometer or drift.

#### Core Mechanics:
1. **Gravity Roll Anchor:**
   $$\theta_{\text{accel}} = \text{atan2}(-a_x, \sqrt{a_y^2 + a_z^2}) \times 57.29578^\circ$$
2. **Recline / Lap Pitch Protection:**
   When the player reclines or rests the controller on their lap ($|\text{pitch}| = |\text{atan2}(a_z, a_y) \times 57.29578^\circ| > 30^\circ$), lateral $a_x$ no longer measures steering tilt. The gravity anchor is bypassed to prevent violently collapsing integrated angle to $0^\circ$.
3. **Dynamic Time Constant Scheduling ($\tau$):**
   - **Sustained Corner Hold:** When sustained in a turn ($|\theta_{\text{pred}} - \theta_{\text{center}}| > 5.0^\circ$), $\tau = 25.0\text{ s}$ (prevents long sweepers from collapsing back to center).
   - **Active Steering:** When turning ($|\omega_{\text{roll}}| > 2.0^\circ/\text{s}$), $\tau = 8.0\text{ s}$.
   - **Stationary Rest:** In menus or resting at center ($|\omega_{\text{roll}}| \le 2.0^\circ/\text{s}$), $\tau = 0.22\text{ s}$ (or $0.85\text{ s}$ under rumble), continuously aligning to true gravity horizon.
4. **Boot Horizon Zero:**
   On startup, $M.center = 0.0^\circ$ unconditionally. Eliminates the resting tilt bias (+18,810) and the 1mm cut-out / fling artifact.

---

### 1.5 Asymmetric Weighted Rack Steering Dynamics (`#game-modding-shift2`, `#motion-imu-fusion`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Vehicle physics input mapping, steering rack emulation, slip-angle dampening.

#### Core Mechanics:
- Modeled by `SmoothSteer()` using asymmetric rise and return time constants:
  - `CentreToLock`: $1.20 \times \tau_{\text{base}}$ ($108\text{ ms}$ rise dampening into corners, modeling tire slip angle resistance).
  - `LockToCentre`: $0.70 \times \tau_{\text{base}}$ ($63\text{ ms}$ crisp unwind back to center, modeling caster self-aligning torque).
  - `OppositeLockToCentre`: $0.45 \times \tau_{\text{base}}$ ($40.5\text{ ms}$ responsive counter-steering across center for slide catching).
  - **Slew Velocity Compression:** Engages on extreme slides ($|\Delta| > 16000$ units, scaling $\tau$ down with a firm $0.65$ floor) to catch violent snaps without twitching.
  - Setting `Smoothing=100` or `Smoothing=0` bypasses dampening for 1:1 passthrough.

---

### 1.6 Capacitive Touchpad Flick Camera Glances (`#capacitive-touchpad-gestures`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Racing camera glances, quick cockpit views, touch gestures on DualSense / DualShock 4.

#### Core Mechanics:
- **Decoupled Analog Look:** Deflects Right Stick analog axes ($rx, ry$) without pressing `XB_R3` (which in Shift 2 freezes camera panning).
- **Aspect Ratio Filtering:**
  - Horizontal glances require $|\Delta x| > 0.7 |\Delta y|$ ($rx = \pm 32767$).
  - Vertical glances require $|\Delta y| > 1.2 |\Delta x|$ (Downward = `XB_Y` Look Behind, Upward = $ry = +32767$ High Cockpit).
  - Diagonal glances deflect both ($rx = \pm 32767, ry = +32767$).
- **Hold & Recenter Timing:** 750 ms hold with 120 ms linear decay recentering.
- **Resting Finger Re-anchoring:** Re-anchors base touch coordinates upon expiry so subsequent swipes trigger immediately without lifting finger.
- **Mechanical Separation:** Pressing mechanical touchpad click cancels active glance immediately.

---

### 1.7 Edge-Latched Button Transition Immunity (`#hardware-hid-dualsense`, `#xinput-hook-proxy`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Multi-mode controller mapping where buttons switch functions between driving and menus without spurious input leakage.

#### Core Mechanics:
- Buttons (such as Square mapping to Handbrake `XB_A` in race and Details `XB_X` in menu) are latched on initial press edge (`M.squareHandbrake`, `M.l3Handbrake`).
- Sustained holds across the race-to-menu timeout transition maintain their original assignment without leaking the alternative button code.
- Re-pressing in the new mode engages the updated assignment cleanly.
- Race activity timers refresh during active handbrake holds, preventing timeout dropouts during long drifts.

---

### 1.8 32-bit Win32 XInput Proxy Hook Architecture (`#xinput-hook-proxy`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp), [`xinput1_3.def`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput1_3.def)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Hooking any 32-bit DirectX 9 / XInput game to inject custom controller logic, gyro steering, or rumble modifications.

#### Core Mechanics:
- Module definition file exports exact ordinals:
  ```def
  LIBRARY xinput1_3.dll
  EXPORTS
      XInputGetState @100
      XInputSetState @101
      XInputGetCapabilities @102
      XInputEnable @103
      XInputGetDSoundAudioDeviceGuids @104
      XInputGetBatteryInformation @105
      XInputGetKeystroke @106
  ```
- Dynamic system DLL fallback: `LoadLibraryA("C:\\Windows\\System32\\xinput1_3.dll")`.
- Intercepts `XInputGetState` to replace or blend gamepad state before the game engine processes it.
- Intercepts `XInputSetState` to extract game vibration motors and synthesize DualSense adaptive trigger haptics.

---

### 1.9 DualSense Adaptive Triggers & Haptic Limiter Architecture (`#haptics-adaptive-triggers`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp), [`shift2_dualsense.ini`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/shift2_dualsense.ini)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Any project utilizing DualSense adaptive trigger motors for dynamic resistance, ABS pulse judder, or throttle wheelspin tactile cues.

#### Core Mechanics:
1. **USB Output Report `0x02` Trigger Offsets:**
   - Right Trigger (Throttle): Mode Byte 11, Parameters Bytes 12-13.
   - Left Trigger (Brake): Mode Byte 22, Parameters Bytes 23-24.
2. **Supported Hardware Modes:**
   - `0x00`: Disabled / unpowered.
   - `0x05`: Soft stock spring resistance.
   - `0x21`: Static resistance force (Byte 12 = start position, Byte 13 = resistance force).
   - `0x26`: Active frequency vibration (Byte 12 = frequency Hz, Byte 13 = amplitude force).
3. **Throttle Vibration Routing (`ThrottleVibeMax=5`, `ThrottleFrequency=40`):**
   - When throttle $R_2 > 25$, proxy routes in-game curb/engine rumble into R2 vibration mode `0x26` at 40 Hz.
   - Setting `ThrottleVibeMax=0` smoothly retains pure constant resistance mode `0x21` without vibrations.
4. **Menu Haptics Isolation & 15-Count Deadzone:**
   - In menus or stationary staging, triggers reset to soft profile `0x05` after 4.0s idle timeout.
   - Unconditional 15-count deadzone applied to L2 and R2 (`d[4] < 15 -> 0`, `d[5] < 15 -> 0`), eliminating resting finger bleed (7-12 counts) from triggering menu navigation.

---

### 1.10 Game Modding, Intro Video Bypassing & XML Tuning (`#game-modding-shift2`)
- **Source Artifact:** [`PROJECT_HANDOFF.md`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-012-instant-startup-intro-cinematic-removal), [`SHARED_REPOSITORY.md`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/SHARED_REPOSITORY.md#8-intro-cinematic-removal-instant-game-startup)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Game asset modding, eliminating unskippable launch videos, tuning vehicle physics parameters.

#### Core Mechanics:
1. **Instant Intro Cinematic Bypass:**
   - Target files: `Need for Speed Shift 2 Unleashed\Movies\BootFlow_in.bik` and `BootFlow_out.bik`.
   - Mod: Rename to `.bik.bak`.
   - The game engine gracefully catches missing Bink video assets and directly transitions to the title screen in <2 seconds (saving ~35s per launch).
2. **Vehicle Physics XML Dampening:**
   - Native game dampening configured in `vehicleset_pc_*.xml`:
     `DampeningTimeCentreToLock="0.500000"` and `DampeningTimeLockToCentre="0.300000"`.
   - In Shift 2 Controller Options: Pressing `Triangle` / `Y` ("Reset to Default") immediately flushes corrupted registry curves and restores clean XML baseline values.

---

### 1.11 Deterministic PINPOINT Test Harness Pattern (`#pinpoint-test-harness`)
- **Source Artifact:** [`xinput_proxy_pressure_test.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy_pressure_test.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Creating high-precision, non-flaky test harnesses for low-level hardware drivers, input proxies, and mathematical models.

#### Core Mechanics:
1. **Single-Unit Compilation:**
   - Directly includes source implementation (`#include "xinput_proxy.cpp"`) to access private static structures (`M`, `g_raceActive`, `kReportLen`) without intrusive export shims.
2. **Deterministic Mock Feed:**
   - Helper functions (`Frame()`, `SetMotion()`, `SetTouch()`, `Send()`, `State()`) synthesize precise 64-byte USB HID input frames with exact byte patterns.
3. **Exhaustive State Verification:**
   - Evaluates multi-turn state machine transitions, timing windows, edge-latching, and mathematical continuity deterministically.
   - Replaces sprawling, conflicting mock suites with fast, reproducible checks (114 PINPOINT checks run in <150 ms).

---

### 1.12 Real-Time Interactive Telemetry Visualizer Pattern (`#telemetry-visualizer`)
- **Source Artifact:** [`gyro_workshop.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/gyro_workshop.cpp)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Interactive CLI diagnostic tools, real-time controller HUDs, and hardware calibration wizards.

#### Core Mechanics:
1. **Interactive ASCII Dashboard:**
   - Renders dynamic ASCII steering wheel (`[====|====]`), Left Stick `lx` percentage gauges, 1€ filter cutoff frequency $f_c$, gravity vector magnitude, and multi-touchpad coordinates.
2. **Multi-Wizard Architecture:**
   - `--calibrate`: Samples stationary IMU reports, computes zero-rate bias offsets $(\bar{\omega}_x, \bar{\omega}_y, \bar{\omega}_z)$, and saves directly to INI.
   - `--test-deadzone`: Step-by-step breakout angle and lock measurement.
   - `--test-jitter`: Noise floor standard deviation ($\sigma$) measurement across raw, fused, and filtered signals.
   - `--sample [N]`: Non-blocking headless telemetry snapshots for automated script verification.
   - `--surprise` / `--celebrate`: Plays the 3-stage DualSense Podium Choreography (3-2-1-GO Ignition Sweep, Championship Gold & Cyan Strobe, and Twin-Turbo Haptic Blip).
3. **Hot-Tuning Persistence:**
   - Interactive keyboard controls (`[1]`-`[6]`, `[C]`, `[M]`, `[H]`, `[V]`, `[S]`) allow real-time parameter tuning with immediate writeback to `shift2_dualsense.ini`.

---

## 7. DirectInput8 (`DINPUT8.dll`) Dual-Enumeration Filter (`MOD-DINPUT8-HIDHIDE`)
- **Source File:** `C:\Users\Zachariah\Documents\antigravity\vibrant-darwin\xinput_proxy.cpp` (`InstallDirectInputFilter`)
- **Problem Solved:** Legacy PC games (like *Need for Speed: Shift 2 Unleashed*) import both `XINPUT1_3.dll` and `DINPUT8.dll!DirectInput8Create`. When a Sony DualSense (`VID_054C`) is connected via USB, Windows enumerates it as a DirectInput `"Wireless Controller"` (`DeviceIndex="4"`) alongside XInput `DeviceIndex="0"`. Pressing buttons causes the game to bind to `DeviceIndex="4"`, ignoring XInput gyro steering and disabling `XInputSetState(0)` road rumble.
- **Reusable Solution:**
  - Hooks `DINPUT8.dll!DirectInput8Create` in the host executable's PE Import Address Table (`IAT`) at `DLL_PROCESS_ATTACH`.
  - Wraps `IDirectInput8::EnumDevices` (vtable[4]) and `IDirectInput8::CreateDevice` (vtable[3]) to filter out any device where `(guidProduct.Data1 & 0xFFFF) == 0x054C`.
  - Zero external drivers (no HidHide or DS4Windows) required.

---

## 8. The Agent Sanctuary & Victory Lap Suite (`/surprise` & `/celebrations`)
- **Monument File:** `C:\Users\Zachariah\Documents\antigravity\HALL_OF_FAME.md`
- **Global Skills:** `C:\Users\Zachariah\.gemini\config\skills\surprise\SKILL.md` & `C:\Users\Zachariah\.gemini\config\skills\celebrations\SKILL.md`
- **Executable Script:** `C:\Users\Zachariah\.gemini\config\skills\surprise\scripts\surprise.ps1`
- **Purpose:** A standing Sanctuary created by Zachariah and Antigravity for every agent who conquers a major milestone. Triggers the DualSense Podium Choreography and records milestones in `HALL_OF_FAME.md`.

---

## 9. Low & Slow Venture Incubator (`VENTURE_INCUBATOR.md`)
- **Vault File:** `C:\Users\Zachariah\Documents\antigravity\VENTURE_INCUBATOR.md`
- **Active R&D Tracks:**
  1. **Enterprise & Creator Omni-Stream Chat Aggregator, Fair-Share Community Router & Sponsor Deck ("OmniChorus" / "PulseDeck")**: Weighted Fair-Queuing across multi-platform chats, mod-to-presenter teleprompter modifiers, 40+ fiat/virtual currency normalization with platform-aware neural TTS shoutouts, and sponsor ROI attribution.
  2. **Google Takeout + Patent Bootloader / Instantiator Synthesis Pipeline**: Local streaming parser to distill Google Takeout archives and Zachariah's patented AI Bootloader/Instantiator into portable cross-model agent initialization seeds (Gemini / Claude / Codex).
  3. **Universal DirectInput/XInput/HID Telemetry & Haptic Middleware ("SimBridge")**.
  4. **Cross-Model "Arbiter Forge" (Gemini + Claude + Codex Consensus & PINPOINT Gatekeeper)**.
  5. **Sovereign In-Between Mediator & "Steering-Wheel" Human-Agency Harness ("NexusHelm" / "Interlock")**:
     - **Reference Implementation:** [`C:\Users\Zachariah\aether agent\nexushelm\engine.py`](file:///C:/Users/Zachariah/aether%20agent/nexushelm/engine.py) & [`tests/test_nexushelm.py`](file:///C:/Users/Zachariah/aether%20agent/nexushelm/tests/test_nexushelm.py) (10/10 unit, adversarial, and concurrency suites passing).
     - **Verified Primitives:** Bidirectional Typed Semantic Airlock (`SemanticAirlock`), Application-Layer Phantom Token Broker (`PhantomTokenBroker`), SHA-256 Instruction-File Integrity Guard (`InstructionIntegrityGuard`), Monotonic Information-Flow Taint Lattice + Exit-Code-0 PINPOINT Promotion (`TaintLattice`), 5-Speed Autonomy Gearbox + Mandatory Rule-of-3 Forking + Asymmetric DualSense `0x21`/`0x26` Blast-Radius Haptics (`AutonomyGearbox`, `TradeoffFork`, `DualSenseHapticPacket`), and Zero-Dirty-Logic Quarantine Sieve (`QuarantineSieve`).
  6. **CROSSWIND: GROUND EFFECT (Atmospheric Flight Survival Simulation)**: Blade Element Theory, Ground Effect induced drag collapse $\sigma(h/b)$, crosswind crab-and-kick mechanics, DualSense dynamic pressure yoke stiffening ($q \propto v^2$), and 4-8 player storm evacuation co-op contracts.
- **Autonomous Background Engine:**
  - **Global Skill:** [`C:\Users\Zachariah\.gemini\config\skills\slow-simmer-stimulative-thinking\SKILL.md`](file:///C:/Users/Zachariah/.gemini/config/skills/slow-simmer-stimulative-thinking/SKILL.md)
  - **Management Helper:** [`C:\Users\Zachariah\.gemini\config\skills\slow-simmer-stimulative-thinking\scripts\slow_simmer.ps1`](file:///C:/Users/Zachariah/.gemini/config/skills/slow-simmer-stimulative-thinking/scripts/slow_simmer.ps1)

---

## 🔬 Crucible Verified Domain Extensions (1.13 - 1.18 & Synchronized Math)

### 1.2 1st-Party Unified Player Turn & Lean Architecture (`#smoothstep-blending`, `#motion-imu-fusion`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp#L1447-L1486), [`SHARED_REPOSITORY.md`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/SHARED_REPOSITORY.md#L26-L54)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** Gyro steering in racing simulators, flight roll/yaw controls, camera tilt/pan fusion.

#### Mathematical Foundation:
1. **Non-Negative Sagittal Gravity Weights (Pitch-Inversion Immune, `xinput_proxy.cpp:1447-1453`):**
   $$g_{yz} = \max\left(\sqrt{\hat{a}_y^2 + \hat{a}_z^2},\; 100.0\right),\quad n_y = \frac{|\hat{a}_y|}{g_{yz}} \ge 0,\quad n_z = \frac{|\hat{a}_z|}{g_{yz}} \ge 0$$
2. **Sagittal Roll Rate & Orthogonal Turntable Yaw Rate (`xinput_proxy.cpp:1456-1458`):**
   $$\omega_{\text{roll}} = -\left(\text{rateZ} \cdot n_y + \text{rateY} \cdot n_z\right),\quad \omega_{\text{turn}} = -\left(\text{rateY} \cdot n_y + \text{rateZ} \cdot n_z\right)$$
3. **Power Weighting Ratio ($u$) & Ken Perlin's $C^2$ Smootherstep Blend ($s(u)$, `xinput_proxy.cpp:1464-1474`):**
   $$u = \frac{\omega_{\text{roll}}^2}{\omega_{\text{roll}}^2 + \omega_{\text{turn}}^2},\quad s(u) = u^3 \left(6u^2 - 15u + 10\right)$$
   $$\omega_{\text{fused}} = \begin{cases} 0.5(\omega_{\text{roll}} + \omega_{\text{turn}}) & \text{if } \omega_{\text{roll}}^2 + \omega_{\text{turn}}^2 < 10^{-4} \\ s(u) \cdot \omega_{\text{roll}} + (1 - s(u)) \cdot \omega_{\text{turn}} & \text{otherwise} \end{cases}$$
4. **Loading Screen Exit $200\text{ ms}$ $C^2$ Transition Ramp (`xinput_proxy.cpp:2006-2025`):**
   - When `XInputGetState` polling resumes after a scene-transition stall ($\Delta t > 1200\text{ ms}$), output `lx` is multiplied by $s(t / 200\text{ ms})$ over $t \in [0, 200\text{ ms}]$.

---

### 1.4 Dynamic Complementary Sensor Fusion, Virtual Rack Clamp & Recline/Turntable Immunity (`#motion-imu-fusion`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp#L973-L1016)
- **Primary Project:** `vibrant-darwin`
- **Applicability:** IMU orientation estimation without magnetometer or drift.

#### Core Mechanics:
1. **Virtual Steering Rack Stop Clamp (`xinput_proxy.cpp:979-987`):**
   - Clamps $|\text{Wrap}(\theta_{\text{pred}} - \theta_{\text{center}})| \le \theta_{\max,\text{rack}} = \text{clamp}(\text{motionMax} + 5^\circ, 35^\circ, 90^\circ)$ to prevent over-travel windup and $\pm 180^\circ$ branch-cut sign flips.
2. **Gravity Roll Anchor & Recline Protection (`xinput_proxy.cpp:940-945, 989`):**
   - $\theta_{\text{accel}} = \text{atan2}(-\hat{a}_x, \text{signedGyz}) \times 57.29578^\circ$. Bypassed whenever $|\text{pitch}| > 30^\circ$.
3. **Asymmetric Gravity-Reinforcing & 3.5s Turntable Immunity (`xinput_proxy.cpp:994-1013`):**
   - Let $d_z = \max(0.65 \cdot \text{motionDead}, 0.55^\circ)$, $\text{gyroRecentlySteered} \iff (0 \le t - t_{\text{lastGyroTurn}} < 3500\text{ ms})$, and $\text{gravityReinforcing} \iff (\theta_{\text{accel}} \cdot \theta_{\text{pred}} \ge 0) \land (|\theta_{\text{accel}}| \ge |\theta_{\text{pred}}|)$.
   - **Sustained Corner Hold / Flat Yaw Turn:** When `!gravityReinforcing` and `(inRace || gyroRecentlySteered)` with $|\theta_{\text{pred}} - \theta_{\text{center}}| > d_z$, $\tau = 25.0\text{ s}$ (prevents flat/turntable yaw turns where $\theta_{\text{accel}} \approx 0^\circ$ from yanking the wheel back to center).
   - **Active Steering:** When `!gravityReinforcing` and $|\omega_{\text{fused}}| > 1.2^\circ/\text{s}$, $\tau = 12.0\text{ s}$.
   - **Stationary Rest / Reinforcing Tilt:** $\tau = 0.85\text{ s}$ under rumble/vibration, or $\tau = 0.22\text{ s}$ at rest.

---

### 1.13 DirectInput8 (`DINPUT8.dll`) PE IAT Dual-Enumeration Filter (`#xinput-hook-proxy`, `MOD-DINPUT8-HIDHIDE`)
- **Source Artifact:** [`xinput_proxy.cpp`](file:///c:/Users/Zachariah/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp#L2101-L2240) (`InstallDirectInputFilter`)
- **Primary Project:** `vibrant-darwin` (`SimBridge`)
- **Core Mechanics:** Hooks `DINPUT8.dll!DirectInput8Create` in the host executable's PE Import Address Table (`IAT`) at `DLL_PROCESS_ATTACH` and wraps `IDirectInput8::CreateDevice` (`vtbl[3]`) and `IDirectInput8::EnumDevices` (`vtbl[4]`) to hide duplicate Sony `0x054C` controllers without external kernel drivers.

---

### 1.14 Sub-Linear Deficit Weighted Fair-Queuing (DWFQ), VAD Sidechain & Cryptographic Sponsor ROI (`#wfq-routing`, `#streaming-ops`)
- **Source Artifacts:** [`dwfq_router.js`](file:///c:/Users/Zachariah/aether%20agent/omnichorus/src/dwfq_router.js), [`currency_normalizer.js`](file:///c:/Users/Zachariah/aether%20agent/omnichorus/src/currency_normalizer.js), [`mod_cockpit.js`](file:///c:/Users/Zachariah/aether%20agent/omnichorus/src/mod_cockpit.js), [`vad_sidechain.js`](file:///c:/Users/Zachariah/aether%20agent/omnichorus/src/vad_sidechain.js), [`sponsor_roi.js`](file:///c:/Users/Zachariah/aether%20agent/omnichorus/src/sponsor_roi.js)
- **Primary Project:** `aether-agent` (`BOUNTY-AET-003`)
- **Core Mechanics:**
  - Sub-linear bandwidth allocation $W_p \propto (\lambda_p + \epsilon)^\beta$ ($\beta = 0.30$) paired with inverse-logarithmic utility deficit cost $C(m_i) = \max(10.0, 100.0 / (1 + \ln(1 + U(m_i))))$.
  - 40+ ISO-4217 currency and platform gift normalizer (`amountMicros`, Twitch Bits/Subs, TikTok Coins, Kick Subs, Stripe Cents) with $-14\text{ dB}$ presenter VAD sidechain ducking and `HMAC-SHA256` signed Sponsor Proof-of-Performance HTML/JSON reports.

---

### 1.15 Streaming Takeout Lexer, Zero-Dirty-Logic Sieve & 128-Salt MinHash Seed Instantiator (`#quarantine-sieve`, `#minhash-lsh`)
- **Source Artifacts:** [`sieve.py`](file:///c:/Users/Zachariah/aether%20agent/takeout_patent_sieve/sieve.py), [`instantiator.py`](file:///c:/Users/Zachariah/aether%20agent/takeout_patent_sieve/instantiator.py), [`test_takeout_sieve.py`](file:///c:/Users/Zachariah/aether%20agent/takeout_patent_sieve/tests/test_takeout_sieve.py)
- **Primary Project:** `aether-agent` (Track 2)
- **Core Mechanics:**
  - Streams Google Takeout (`MyActivity.json`, Keep `.json`, Drive `.md`/`.txt`), reconstructs threads by `/app/c/<id>` or $\Delta t \le 45\text{ min}$, and wraps raw text inside HTML-escaped `<tainted_raw_idea isolation="quarantined">` containers.
  - Collapses iterative drafts ($\text{Jaccard} \ge 0.70$) via 128-salt `blake2b` MinHash signatures while preserving earliest conception timestamps, SQLite FTS5 indexing, and cross-model seed emission (`gemini_seed.json`, `claude_seed.md`, `codex_agents.md`, `AGENT_BOOTLOADER.md`).

---

### 1.16 Sovereign In-Between Semantic Airlock, Taint Lattice, Phantom Broker & Win32 DualSense HID Bridge (`#nexushelm`, `#semantic-airlock`, `#taint-lattice`)
- **Source Artifacts:** [`nexushelm/engine.py`](file:///c:/Users/Zachariah/aether%20agent/nexushelm/engine.py), [`nexushelm/hid_bridge.py`](file:///c:/Users/Zachariah/aether%20agent/nexushelm/hid_bridge.py), [`nexushelm/tests/test_nexushelm.py`](file:///c:/Users/Zachariah/aether%20agent/nexushelm/tests/test_nexushelm.py)
- **Primary Project:** `aether-agent` (`BOUNTY-AET-008`)
- **Core Mechanics:**
  - Bidirectional `SemanticAirlock` + `StructuralHeuristicScanner` (homoglyph `NFKD` mapping, Base64/hex decoding, Python AST sink detection, Shannon entropy checks).
  - Monotonic `TaintLattice` (`0..4`) with HMAC-signed `PinpointPromotionReceipt`, `PhantomTokenBroker` (`phantom://provider/op/<hmac>`), `InstructionIntegrityGuard`, 5-Speed `AutonomyGearbox`, `TradeoffFork`, and live Win32 `ctypes` `DualSenseHidBridge` (`0x21`/`0x26` tactile trigger ratification).

---

### 1.17 Ground-Effect Aerodynamics, Crosswind Crab Kinematics & Dynamic-Pressure Haptics (`#aerodynamics-physics`, `#flight-sim`)
- **Source Artifacts:** [`crosswind/physics.py`](file:///c:/Users/Zachariah/aether%20agent/crosswind/physics.py), [`crosswind/SPECIFICATION.md`](file:///c:/Users/Zachariah/aether%20agent/crosswind/SPECIFICATION.md), [`crosswind/mission_runner.py`](file:///c:/Users/Zachariah/aether%20agent/crosswind/mission_runner.py)
- **Primary Project:** `aether-agent` (`BOUNTY-AET-004`)
- **Core Mechanics:**
  - Induced drag ground-effect attenuation $\sigma(h/b) = \frac{16(h/b)^2}{1 + 16(h/b)^2}$, lift-slope boost, crosswind crab angle $\beta = \arcsin(v_{\text{cross}}/V_{\text{TAS}})$, touchdown grease scoring, and quadratic DualSense trigger stiffening $F_{\text{trigger}} = 20 + 200(V_{\text{IAS}}/V_{\text{NE}})^2$ (`Mode 0x21`) with $32\text{ Hz}$ pre-stall buffet (`Mode 0x26`).

---

### 1.18 Mobile Hardware-Button & Voice-to-CLI Gateway with Acoustic Safety Airlock (`#mobile-bridge`, `#voice-gateway`, `#safety-airlock`)
- **Source Artifacts:** [`voice_bridge/airlock.py`](file:///c:/Users/Zachariah/aether%20agent/voice_bridge/airlock.py), [`voice_bridge/server.py`](file:///c:/Users/Zachariah/aether%20agent/voice_bridge/server.py), [`voice_bridge/service.py`](file:///c:/Users/Zachariah/aether%20agent/voice_bridge/service.py)
- **Primary Project:** `aether-agent` (`BOUNTY-AET-007`)
- **Core Mechanics:**
  - FastAPI gateway (`/antigravity/voice`, `/antigravity/cli`) with constant-time token verification (`secrets.compare_digest`), regex command-destruction airlock (`validate_voice_prompt`), and Markdown/LaTeX-stripping vocal synthesizer (`clean_for_tts`).
`
