# Kuchipudi Mudra Recognizer 🩰🔮

A real-time hand gesture recognition system for classical Kuchipudi *asamyukta hastas* (single-hand gestures). Powered by client-side **MediaPipe Tasks Vision**, scale/translation-invariant geometric feature engineering, **scikit-learn** classifiers (KNN & SVM), **FastAPI** with async **Motor** (MongoDB), and a **React 18 + Vite** dark glassmorphism interface.

---

## 🌟 Highlights

- **Hero Vision Feed**: Full-bleed webcam experience with glowing skeleton overlay, joint-specific luminescence, and micro-interaction radial confidence rings.
- **Invariant Feature Engineering (33-dim)**: Completely invariant to hand scale, distance, and screen translation:
  - 15 joint flexion angles (3 per finger)
  - 10 normalized fingertip-to-fingertip distances
  - 5 normalized fingertip-to-wrist distances
  - 3 palm normal vector coordinates ($n_x, n_y, n_z$)
- **Data Collection Studio**: Burst-capture 25 frames with subtle wrist tilts, animated tick counters, and class balance indicators.
- **Interactive Model Training**: Retrain KNN (k=5) or SVM (RBF) in one click with a strict 80/20 train/validation split, confusion matrix heatmap, and per-class precision/recall reports.
- **Resilient Dual Storage**: Uses Motor (MongoDB) when online, with seamless local JSON fallback so the app works instantly out-of-the-box.
- **Throttled Live Inference**: Video runs at 60 FPS while predictions throttle to 10–12 Hz to maximize battery life and avoid network congestion.

---

## 🪷 Supported Mudras (Asamyukta Hastas)

| Mudra | Sanskrit | Meaning | Key Pose Geometry |
|---|---|---|---|
| **Pataka** | पताक | Flag / Victory / River | 4 straight fingers joined; thumb bent touching palm edge |
| **Tripataka** | त्रिपताक | Crown / Arrow / Tree | Pataka gesture with ring finger bent down |
| **Ardhapataka** | अर्धपताक | Half Flag / Tower / Knife | Pataka gesture with both ring and pinky fingers bent |
| **Kartarimukha** | कर्तरीमुख | Scissors / Separation | Index and middle fingers in wide 'V'; ring and pinky held down |
| **Mayura** | मयूर | Peacock / Grace / Tilak | Ring fingertip touches thumb tip in a loop; other fingers upright |
| **Ardhachandra** | अर्धचन्द्र | Crescent Moon / Plate | 4 straight joined fingers with thumb stretched wide outward |
| **Mushti** | मुष्टि | Fist / Strength / Grasping | 4 fingers curled into tight fist with thumb wrapped across |
| **Shikhara** | शिखर | Peak / Spire / Lingam | Fist with thumb pointing straight up |

---

## 🚀 Quick Start

### Option 1: Run Locally (Recommended for Development)

#### 1. Start Backend (Terminal 1)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

#### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
- App UI: [http://localhost:5173](http://localhost:5173)

---

### Option 2: Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- MongoDB: `localhost:27017`

---

## 📐 33-Dimensional Feature Pipeline

Raw pixel coordinates vary drastically when the user moves closer or farther from the webcam. To ensure the model recognizes gestures across different hand sizes and distances:

1. **15 Flexion Angles**:
   $$\theta = \arccos\left(\frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|\|\vec{v}\|}\right) \times \frac{180}{\pi}$$
   Computed for all 3 consecutive joint triplets across all 5 fingers.
2. **10 Fingertip Distances**:
   All pairwise Euclidean distances between fingertips $[4, 8, 12, 16, 20]$ divided by palm scale $d_{\text{palm}} = \|\text{Landmark}_9 - \text{Landmark}_0\|$.
3. **5 Fingertip-to-Wrist Distances**:
   Distance from each fingertip to Landmark 0 divided by $d_{\text{palm}}$.
4. **3 Palm Normal Components**:
   Unit cross product $(\text{Landmark}_5 - \text{Landmark}_0) \times (\text{Landmark}_{17} - \text{Landmark}_0)$, aligned for handedness.

---

## 🛠️ API Reference

- `GET /api/v1/mudras` — Catalog of target mudras, Sanskrit names, descriptions, and pose guides.
- `POST /api/v1/predict` — Classify 21 landmarks or 33 features. Returns mudra, confidence score, and all probabilities.
- `POST /api/v1/samples` — Record a labeled sample for training.
- `GET /api/v1/samples/stats` — Dataset sample distribution and class balance diagnostics.
- `POST /api/v1/train` — Retrain classifier with 80/20 train/val split. Returns confusion matrix and validation report.
- `POST /api/v1/samples/seed` — Seed dataset with 280 canonical samples.
- `DELETE /api/v1/samples` — Clear dataset.

---

## 🧪 Testing

Run the automated backend test suite:
```bash
cd backend
python test_backend.py
```
Validates:
- Scale and translation invariance ($\Delta < 0.0002$)
- Seed dataset generation and held-out validation metrics
- Real-time inference across all 8 mudras
- Storage persistence and fallback
