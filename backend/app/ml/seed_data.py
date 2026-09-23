import numpy as np
from typing import List, Dict, Any
from app.ml.features import extract_features

def generate_canonical_landmarks(mudra: str, rng: np.random.Generator) -> np.ndarray:
    """
    Generates a realistic 3D hand skeleton (21 landmarks) for a given Kuchipudi mudra,
    with anatomical proportions and small natural biomechanical jitter.
    """
    # Base canonical hand positions (wrist at origin [0, 0, 0])
    # Skeleton proportions normalized around middle finger MCP at [0, 1.0, 0]
    landmarks = np.zeros((21, 3), dtype=np.float32)
    landmarks[0] = [0.0, 0.0, 0.0]  # Wrist

    # Base MCP positions across palm arch
    # Index MCP (5), Middle MCP (9), Ring MCP (13), Pinky MCP (17)
    landmarks[5]  = [-0.40, 0.95, -0.05]
    landmarks[9]  = [-0.05, 1.05, 0.0]
    landmarks[13] = [0.28, 0.95, 0.03]
    landmarks[17] = [0.55, 0.82, 0.06]

    # Thumb CMC (1), MCP (2)
    landmarks[1]  = [-0.35, 0.35, -0.10]
    landmarks[2]  = [-0.60, 0.60, -0.15]

    # Helper: project finger segments along a ray or curl
    def build_finger(mcp_idx: int, is_curled: bool, curl_tightness: float = 1.0, spread_x: float = 0.0):
        mcp = landmarks[mcp_idx]
        pip_idx = mcp_idx + 1
        dip_idx = mcp_idx + 2
        tip_idx = mcp_idx + 3
        
        seg_len = 0.35
        if not is_curled:
            # Extended straight
            landmarks[pip_idx] = mcp + [spread_x * 0.3, seg_len, 0.0]
            landmarks[dip_idx] = landmarks[pip_idx] + [spread_x * 0.2, seg_len * 0.85, 0.0]
            landmarks[tip_idx] = landmarks[dip_idx] + [spread_x * 0.1, seg_len * 0.75, 0.0]
        else:
            # Curled into palm
            landmarks[pip_idx] = mcp + [0.0, seg_len * 0.4, 0.35 * curl_tightness]
            landmarks[dip_idx] = landmarks[pip_idx] + [0.0, -seg_len * 0.5, 0.20 * curl_tightness]
            landmarks[tip_idx] = landmarks[dip_idx] + [0.0, -seg_len * 0.4, -0.10 * curl_tightness]

    def build_thumb(state: str):
        # state: "touch_ring", "folded", "upright", "abducted", "bent_pataka"
        mcp = landmarks[2]
        if state == "upright":  # Shikhara
            landmarks[3] = mcp + [-0.15, 0.35, 0.0]
            landmarks[4] = landmarks[3] + [-0.05, 0.35, 0.0]
        elif state == "abducted":  # Ardhachandra
            landmarks[3] = mcp + [-0.45, 0.20, 0.0]
            landmarks[4] = landmarks[3] + [-0.40, 0.15, 0.0]
        elif state == "touch_ring":  # Mayura
            landmarks[3] = [-0.15, 0.90, 0.20]
            landmarks[4] = [0.15, 0.95, 0.25]
        elif state == "folded":  # Mushti, Kartarimukha
            landmarks[3] = [-0.20, 0.70, 0.35]
            landmarks[4] = [0.05, 0.70, 0.30]
        else:  # Pataka, Tripataka, Ardhapataka
            landmarks[3] = [-0.45, 0.75, 0.0]
            landmarks[4] = [-0.30, 0.85, 0.05]

    # Configure finger positions according to the mudra rules
    if mudra == "Pataka":
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        build_finger(13, is_curled=False)
        build_finger(17, is_curled=False)
        build_thumb("bent_pataka")

    elif mudra == "Tripataka":
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        build_finger(13, is_curled=True, curl_tightness=1.0)
        build_finger(17, is_curled=False)
        build_thumb("bent_pataka")

    elif mudra == "Ardhapataka":
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        build_finger(13, is_curled=True, curl_tightness=1.0)
        build_finger(17, is_curled=True, curl_tightness=1.0)
        build_thumb("bent_pataka")

    elif mudra == "Kartarimukha":
        # Index & middle wide apart in V shape
        build_finger(5, is_curled=False, spread_x=-0.40)
        build_finger(9, is_curled=False, spread_x=0.35)
        build_finger(13, is_curled=True, curl_tightness=1.2)
        build_finger(17, is_curled=True, curl_tightness=1.2)
        build_thumb("folded")

    elif mudra == "Mayura":
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        # Ring finger touches thumb tip
        landmarks[14] = [0.25, 0.85, 0.20]
        landmarks[15] = [0.20, 0.90, 0.25]
        landmarks[16] = [0.15, 0.95, 0.25]
        build_finger(17, is_curled=False)
        build_thumb("touch_ring")

    elif mudra == "Ardhachandra":
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        build_finger(13, is_curled=False)
        build_finger(17, is_curled=False)
        build_thumb("abducted")

    elif mudra == "Mushti":
        build_finger(5, is_curled=True, curl_tightness=1.1)
        build_finger(9, is_curled=True, curl_tightness=1.1)
        build_finger(13, is_curled=True, curl_tightness=1.1)
        build_finger(17, is_curled=True, curl_tightness=1.1)
        build_thumb("folded")

    elif mudra == "Shikhara":
        build_finger(5, is_curled=True, curl_tightness=1.1)
        build_finger(9, is_curled=True, curl_tightness=1.1)
        build_finger(13, is_curled=True, curl_tightness=1.1)
        build_finger(17, is_curled=True, curl_tightness=1.1)
        build_thumb("upright")

    else:
        # Default straight hand
        build_finger(5, is_curled=False)
        build_finger(9, is_curled=False)
        build_finger(13, is_curled=False)
        build_finger(17, is_curled=False)
        build_thumb("bent_pataka")

    # Add realistic variations: random scale, rotation, translation, joint noise
    scale = rng.uniform(0.85, 1.25)
    landmarks *= scale

    # 3D rotation angles in radians
    rx = np.radians(rng.uniform(-18.0, 18.0))
    ry = np.radians(rng.uniform(-20.0, 20.0))
    rz = np.radians(rng.uniform(-22.0, 22.0))

    # Rotation matrices
    Rx = np.array([[1, 0, 0], [0, np.cos(rx), -np.sin(rx)], [0, np.sin(rx), np.cos(rx)]])
    Ry = np.array([[np.cos(ry), 0, np.sin(ry)], [0, 1, 0], [-np.sin(ry), 0, np.cos(ry)]])
    Rz = np.array([[np.cos(rz), -np.sin(rz), 0], [np.sin(rz), np.cos(rz), 0], [0, 0, 1]])
    R = Rz @ Ry @ Rx

    landmarks = landmarks @ R.T

    # Small anatomical jitter per joint (std = 0.02)
    noise = rng.normal(0.0, 0.02, landmarks.shape).astype(np.float32)
    noise[0] = 0.0  # Keep wrist stable
    landmarks += noise

    # Translation offset
    tx = rng.uniform(0.3, 0.7)
    ty = rng.uniform(0.3, 0.7)
    tz = rng.uniform(-0.1, 0.1)
    landmarks += [tx, ty, tz]

    return landmarks

def generate_seed_dataset(samples_per_mudra: int = 40) -> List[Dict[str, Any]]:
    """Generates a complete initial seed dataset for all 8 target Kuchipudi mudras."""
    from app.core.mudras_data import TARGET_MUDRA_NAMES
    rng = np.random.default_rng(42)

    samples = []
    for mudra in TARGET_MUDRA_NAMES:
        for i in range(samples_per_mudra):
            landmarks = generate_canonical_landmarks(mudra, rng)
            lm_list = [{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in landmarks]
            features = extract_features(lm_list, handedness="Right")
            
            samples.append({
                "id": f"seed_{mudra.lower()}_{i+1:03d}",
                "mudra": mudra,
                "landmarks": lm_list,
                "features": features,
                "handedness": "Right",
                "session_id": "seed_initial_pack",
                "created_at": "2026-09-23T00:00:00Z"
            })

    return samples
