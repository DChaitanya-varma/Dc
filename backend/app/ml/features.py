import numpy as np
from typing import List, Union, Dict, Any

FINGER_TRIPLETS = [
    # Thumb
    (0, 1, 2), (1, 2, 3), (2, 3, 4),
    # Index
    (0, 5, 6), (5, 6, 7), (6, 7, 8),
    # Middle
    (0, 9, 10), (9, 10, 11), (10, 11, 12),
    # Ring
    (0, 13, 14), (13, 14, 15), (14, 15, 16),
    # Pinky
    (0, 17, 18), (17, 18, 19), (18, 19, 20)
]

FINGERTIPS = [4, 8, 12, 16, 20]

FINGERTIP_PAIRS = [
    (4, 8), (4, 12), (4, 16), (4, 20),
    (8, 12), (8, 16), (8, 20),
    (12, 16), (12, 20),
    (16, 20)
]

def calculate_angle(p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
    """Calculates angle in degrees at vertex p2 between vectors p1-p2 and p3-p2."""
    v1 = p1 - p2
    v2 = p3 - p2
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 < 1e-6 or norm2 < 1e-6:
        return 0.0
    cosine = np.dot(v1, v2) / (norm1 * norm2)
    cosine = np.clip(cosine, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosine)))

def extract_features(landmarks: Union[List[Dict[str, float]], List[Any]], handedness: str = "Right") -> List[float]:
    """
    Extracts 33 scale-, translation-, and rotation-engineered features from 21 MediaPipe hand landmarks.
    
    Returns:
        33-dimensional float list:
        - [0..14]: 15 joint flexion angles (degrees, 3 per finger)
        - [15..24]: 10 fingertip-to-fingertip distances normalized by palm width
        - [25..29]: 5 fingertip-to-wrist distances normalized by palm width
        - [30..32]: 3 palm normal vector coordinates (nx, ny, nz)
    """
    if len(landmarks) != 21:
        raise ValueError(f"Expected 21 landmarks, received {len(landmarks)}")

    # Parse to shape (21, 3)
    coords = np.zeros((21, 3), dtype=np.float32)
    for i, lm in enumerate(landmarks):
        if isinstance(lm, dict):
            coords[i] = [lm.get('x', 0.0), lm.get('y', 0.0), lm.get('z', 0.0)]
        elif hasattr(lm, 'x') and hasattr(lm, 'y') and hasattr(lm, 'z'):
            coords[i] = [lm.x, lm.y, lm.z]
        elif isinstance(lm, (list, tuple)) and len(lm) >= 3:
            coords[i] = [lm[0], lm[1], lm[2]]
        else:
            raise ValueError(f"Unsupported landmark item format at index {i}: {type(lm)}")

    features: List[float] = []

    # 1. 15 Joint flexion angles
    for a, b, c in FINGER_TRIPLETS:
        angle = calculate_angle(coords[a], coords[b], coords[c])
        features.append(angle)

    # 2. Palm scale normalization reference: Wrist (0) to Middle MCP (9)
    wrist = coords[0]
    middle_mcp = coords[9]
    palm_scale = float(np.linalg.norm(middle_mcp - wrist))
    if palm_scale < 1e-5:
        palm_scale = 1.0

    # 3. 10 Fingertip-to-fingertip normalized distances
    for i, j in FINGERTIP_PAIRS:
        dist = float(np.linalg.norm(coords[i] - coords[j])) / palm_scale
        features.append(dist)

    # 4. 5 Fingertip-to-wrist normalized distances
    for tip in FINGERTIPS:
        dist = float(np.linalg.norm(coords[tip] - wrist)) / palm_scale
        features.append(dist)

    # 5. Palm orientation vector: normal of plane formed by Wrist(0), Index MCP(5), Pinky MCP(17)
    v_index = coords[5] - coords[0]
    v_pinky = coords[17] - coords[0]
    normal = np.cross(v_index, v_pinky)
    norm_len = float(np.linalg.norm(normal))
    if norm_len > 1e-6:
        unit_normal = normal / norm_len
    else:
        unit_normal = np.array([0.0, 0.0, 1.0], dtype=np.float32)

    # Flip normal if left hand to ensure handedness invariance
    if handedness.lower().startswith("left"):
        unit_normal = -unit_normal

    features.append(float(unit_normal[0]))
    features.append(float(unit_normal[1]))
    features.append(float(unit_normal[2]))

    return features
