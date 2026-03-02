import cv2
import mediapipe as mp
import numpy as np
import time
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core.base_options import BaseOptions

# ================= CONFIG =================
MODEL_PATH = r"C:\codingan\project\hand_landmarker.task"
SMOOTHING_ALPHA = 0.35
BRUSH_SIZE = 8
GESTURE_CONFIRM_FRAMES = 4

# Default color = BLUE
current_color = (255, 0, 0)

# Color palette (BGR)
color_palette = [
    (255, 0, 0),     # Blue
    (0, 255, 0),     # Green
    (0, 0, 255),     # Red
    (0, 255, 255),   # Yellow
    (255, 0, 255),   # Purple
    (0, 165, 255)    # Orange
]

# ================= MEDIAPIPE INIT =================
options = vision.HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=vision.RunningMode.VIDEO,
    num_hands=1
)

landmarker = vision.HandLandmarker.create_from_options(options)

# ================= CAMERA =================
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 960)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

canvas = None
prev_point = None
smoothed_point = None

draw_counter = 0
erase_counter = 0
fist_counter = 0
gesture_state = "NONE"

print("Press Q to exit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    if canvas is None:
        canvas = np.zeros_like(frame)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    timestamp = int(time.time() * 1000)
    result = landmarker.detect_for_video(mp_image, timestamp)

    mode = "NONE"

    if result.hand_landmarks:
        lm = result.hand_landmarks[0]

        def px(p):
            return int(p.x * w), int(p.y * h)

        # ================= FINGER STATES =================
        index_up = lm[8].y < lm[6].y
        middle_up = lm[12].y < lm[10].y
        ring_up = lm[16].y < lm[14].y
        pinky_up = lm[20].y < lm[18].y

        fingers_up_count = sum([index_up, middle_up, ring_up, pinky_up])

        # DRAW = angka 1
        if index_up and not middle_up and not ring_up and not pinky_up:
            draw_counter += 1
            erase_counter = 0
            fist_counter = 0

        # ERASE = semua jari terbuka
        elif fingers_up_count == 4:
            erase_counter += 1
            draw_counter = 0
            fist_counter = 0

        # FIST = semua jari tertutup
        elif fingers_up_count == 0:
            fist_counter += 1
            draw_counter = 0
            erase_counter = 0

        else:
            draw_counter = erase_counter = fist_counter = 0

        if draw_counter >= GESTURE_CONFIRM_FRAMES:
            gesture_state = "DRAW"
        elif erase_counter >= GESTURE_CONFIRM_FRAMES:
            gesture_state = "ERASE"
        elif fist_counter >= GESTURE_CONFIRM_FRAMES:
            gesture_state = "FIST"
        else:
            gesture_state = "NONE"

        mode = gesture_state

        # ================= SMOOTHING =================
        index_point = px(lm[8])

        if smoothed_point is None:
            smoothed_point = index_point
        else:
            smoothed_point = (
                int(SMOOTHING_ALPHA * index_point[0] + (1 - SMOOTHING_ALPHA) * smoothed_point[0]),
                int(SMOOTHING_ALPHA * index_point[1] + (1 - SMOOTHING_ALPHA) * smoothed_point[1])
            )

        # ================= DRAW =================
        if gesture_state == "DRAW":

            if prev_point is None:
                prev_point = smoothed_point

            cv2.line(canvas,
                     prev_point,
                     smoothed_point,
                     current_color,
                     BRUSH_SIZE,
                     cv2.LINE_AA)

            prev_point = smoothed_point
        else:
            prev_point = None

        # ================= ERASE =================
        if gesture_state == "ERASE":
            canvas = np.zeros_like(frame)

        # ================= COLOR PICKER =================
        if gesture_state == "FIST":
            for i, color in enumerate(color_palette):
                x1 = w - 60
                y1 = 50 + i * 70
                x2 = w - 10
                y2 = y1 + 50

                if x1 < smoothed_point[0] < x2 and y1 < smoothed_point[1] < y2:
                    current_color = color

    # ================= DRAW COLOR PANEL =================
    for i, color in enumerate(color_palette):
        x1 = w - 60
        y1 = 50 + i * 70
        x2 = w - 10
        y2 = y1 + 50

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, -1)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255,255,255), 2)

    combined = cv2.addWeighted(frame, 0.8, canvas, 1, 0)

    cv2.putText(combined,
                f"MODE: {mode}",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2)

    cv2.imshow("AR Writing - Real Feel", combined)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
