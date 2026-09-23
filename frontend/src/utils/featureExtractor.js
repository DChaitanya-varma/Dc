/**
 * 33-Dimensional Scale- and Rotation-Invariant Feature Extractor.
 * Exactly mirrors the mathematical pipeline in backend/app/ml/features.py.
 */

const FINGER_TRIPLETS = [
  // Thumb
  [0, 1, 2], [1, 2, 3], [2, 3, 4],
  // Index
  [0, 5, 6], [5, 6, 7], [6, 7, 8],
  // Middle
  [0, 9, 10], [9, 10, 11], [10, 11, 12],
  // Ring
  [0, 13, 14], [13, 14, 15], [14, 15, 16],
  // Pinky
  [0, 17, 18], [17, 18, 19], [18, 19, 20]
];

const FINGERTIPS = [4, 8, 12, 16, 20];

const FINGERTIP_PAIRS = [
  [4, 8], [4, 12], [4, 16], [4, 20],
  [8, 12], [8, 16], [8, 20],
  [12, 16], [12, 20],
  [16, 20]
];

function norm3(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function dist3(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateAngleDegrees(p1, p2, p3) {
  const v1 = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];
  const n1 = norm3(v1);
  const n2 = norm3(v2);
  if (n1 < 1e-6 || n2 < 1e-6) return 0.0;
  let cosine = (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / (n1 * n2);
  cosine = Math.max(-1.0, Math.min(1.0, cosine));
  return (Math.acos(cosine) * 180.0) / Math.PI;
}

export function extractHandFeatures(landmarks, handedness = "Right") {
  if (!landmarks || landmarks.length !== 21) {
    throw new Error(`Expected 21 landmarks, received ${landmarks ? landmarks.length : 0}`);
  }

  // Convert landmarks to array format [x, y, z]
  const coords = landmarks.map(lm => [lm.x, lm.y, lm.z || 0.0]);
  const features = [];

  // 1. 15 Joint flexion angles (3 per finger)
  for (const [a, b, c] of FINGER_TRIPLETS) {
    features.push(calculateAngleDegrees(coords[a], coords[b], coords[c]));
  }

  // 2. Palm reference scale: Wrist(0) to Middle MCP(9)
  const wrist = coords[0];
  const middleMcp = coords[9];
  let palmScale = dist3(wrist, middleMcp);
  if (palmScale < 1e-5) palmScale = 1.0;

  // 3. 10 Fingertip-to-fingertip normalized distances
  for (const [i, j] of FINGERTIP_PAIRS) {
    features.push(dist3(coords[i], coords[j]) / palmScale);
  }

  // 4. 5 Fingertip-to-wrist normalized distances
  for (const tip of FINGERTIPS) {
    features.push(dist3(coords[tip], wrist) / palmScale);
  }

  // 5. Palm normal vector: (Wrist->Index MCP) x (Wrist->Pinky MCP)
  const vIndex = [coords[5][0] - wrist[0], coords[5][1] - wrist[1], coords[5][2] - wrist[2]];
  const vPinky = [coords[17][0] - wrist[0], coords[17][1] - wrist[1], coords[17][2] - wrist[2]];
  
  // Cross product
  let nx = vIndex[1] * vPinky[2] - vIndex[2] * vPinky[1];
  let ny = vIndex[2] * vPinky[0] - vIndex[0] * vPinky[2];
  let nz = vIndex[0] * vPinky[1] - vIndex[1] * vPinky[0];
  const nLen = norm3([nx, ny, nz]);

  if (nLen > 1e-6) {
    nx /= nLen;
    ny /= nLen;
    nz /= nLen;
  } else {
    nx = 0.0;
    ny = 0.0;
    nz = 1.0;
  }

  if (handedness && handedness.toLowerCase().startsWith("left")) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }

  features.push(nx, ny, nz);

  return features;
}
