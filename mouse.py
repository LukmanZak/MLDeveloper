import cv2
import pyautogui
import time
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ================= CONFIG =================

MODEL_PATH = r"hand_landmarker.task"

SCREEN_W, SCREEN_H = 1920, 1200

SMOOTHENING = 3
CLICK_DELAY = 0.25
FRAME_SKIP = 2

# ===== Scroll tuning (🔥 ini kunci mulus) =====
SCROLL_DAMPING = 0.85
SCROLL_GAIN = 0.04
SCROLL_DEADZONE = 2
DEADZONE = 5          # anti goyang kecil tangan
FILTER_ALPHA = 0.8   # 0.5–0.8 → makin besar makin halus
# ===========================================

prev_x, prev_y = 0, 0
last_click_time = 0
frame_count = 0

scroll_prev_y = None
scroll_velocity = 0.0

# ================= LANDMARKER =================

BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

# ================= CAMERA =================

cap = cv2.VideoCapture(0)
cap.set(3, 320)
cap.set(4, 240)

# ================= FINGER STATES =================

def finger_states(lm):
    return {
        "index":  lm[8].y  < lm[6].y,
        "middle": lm[12].y < lm[10].y,
        "ring":   lm[16].y < lm[14].y,
        "pinky":  lm[20].y < lm[18].y,
        "thumb":  lm[4].x  > lm[3].x
    }

# ================= MAIN LOOP =================

while True:
    success, frame = cap.read()
    if not success:
        continue

    frame_count += 1
    frame = cv2.flip(frame, 1)

    if frame_count % FRAME_SKIP != 0:
        cv2.imshow("Virtual Mouse", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break
        continue

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )

    timestamp_ms = int(time.time() * 1000)
    result = landmarker.detect_for_video(mp_image, timestamp_ms)

    if result.hand_landmarks:

        lm = result.hand_landmarks[0]
        states = finger_states(lm)

        index  = states["index"]
        middle = states["middle"]
        ring   = states["ring"]
        pinky  = states["pinky"]

        x_screen = lm[8].x * SCREEN_W
        y_screen = lm[8].y * SCREEN_H

        dx = x_screen - prev_x
        dy = y_screen - prev_y

        # Deadzone anti micro jitter
        if abs(dx) < DEADZONE:
            dx = 0
        if abs(dy) < DEADZONE:
            dy = 0

        curr_x = prev_x + dx * FILTER_ALPHA
        curr_y = prev_y + dy * FILTER_ALPHA

        now = time.time()

        # ================= GESTURES =================

        # ✅ MOVE → hanya telunjuk
        if index and not middle and not ring and not pinky:
            pyautogui.moveTo(curr_x, curr_y, _pause=False)
            scroll_prev_y = None
            scroll_velocity = 0

        # ✅ LEFT CLICK → telunjuk + tengah
        elif index and middle and not ring and not pinky:
            if now - last_click_time > CLICK_DELAY:
                pyautogui.click()
                last_click_time = now

            scroll_prev_y = None
            scroll_velocity = 0

        # ✅ RIGHT CLICK → tiga jari
        elif index and middle and ring and not pinky:
            if now - last_click_time > CLICK_DELAY:
                pyautogui.rightClick()
                last_click_time = now

            scroll_prev_y = None
            scroll_velocity = 0

        # ✅ SCROLL → empat jari (🔥 smooth mode)
        elif index and middle and ring and pinky:

            if scroll_prev_y is None:
                scroll_prev_y = curr_y
                scroll_velocity = 0
            else:
                dy = curr_y - scroll_prev_y
                scroll_prev_y = curr_y

                if abs(dy) > SCROLL_DEADZONE:
                    scroll_velocity = (
                        scroll_velocity * SCROLL_DAMPING
                        + dy * SCROLL_GAIN * 100
                    )

                    pyautogui.scroll(int(-scroll_velocity))

        else:
            scroll_prev_y = None
            scroll_velocity = 0

        prev_x, prev_y = curr_x, curr_y

    else:
        scroll_prev_y = None
        scroll_velocity = 0

    cv2.imshow("Virtual Mouse", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()