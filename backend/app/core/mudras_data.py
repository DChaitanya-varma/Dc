from typing import Dict, Any, List

MUDRAS_CATALOG: Dict[str, Dict[str, Any]] = {
    "Pataka": {
        "id": "pataka",
        "name": "Pataka",
        "sanskrit": "पताक",
        "meaning": "Flag / Victory / Forest / River",
        "category": "Asamyukta Hasta",
        "description": "All four fingers are held straight, erect, and pressed tightly against each other. The thumb is bent slightly at the base, touching the lower side of the index finger.",
        "pose_guidance": "Extend all 4 fingers straight upwards touching each other. Bend your thumb slightly touching the side of your palm.",
        "icon": "flag",
        "color": "#38bdf8",  # Cyan
        "sloka_reference": "Natyashastra / Abhinaya Darpana: 'Natyarambhe varidhare vane vastuvinishedhane...'"
    },
    "Tripataka": {
        "id": "tripataka",
        "name": "Tripataka",
        "sanskrit": "त्रिपताक",
        "meaning": "Three Parts of Flag / Crown / Arrow / Tree",
        "category": "Asamyukta Hasta",
        "description": "Form Pataka mudra first, then bend down the ring finger at its proximal/middle joint while keeping index, middle, and pinky upright.",
        "pose_guidance": "Keep index, middle, and pinky fingers straight up. Bend your ring finger firmly inward toward your palm.",
        "icon": "crown",
        "color": "#818cf8",  # Indigo
        "sloka_reference": "Abhinaya Darpana: 'Makute vrikshabhaveshu vajre taddharane tathaa...'"
    },
    "Ardhapataka": {
        "id": "ardhapataka",
        "name": "Ardhapataka",
        "sanskrit": "अर्धपताक",
        "meaning": "Half Flag / Sprout / Tower / Knife",
        "category": "Asamyukta Hasta",
        "description": "Form Tripataka mudra, then bend both the ring finger and the little (pinky) finger down simultaneously, keeping index and middle straight.",
        "pose_guidance": "Keep index and middle fingers straight up together. Bend both ring finger and pinky down into the palm.",
        "icon": "feather",
        "color": "#a855f7",  # Purple
        "sloka_reference": "Abhinaya Darpana: 'Pallave phalake teere hyubhayoriti vachane...'"
    },
    "Kartarimukha": {
        "id": "kartarimukha",
        "name": "Kartarimukha",
        "sanskrit": "कर्तरीमुख",
        "meaning": "Scissors Face / Separation / Lightning",
        "category": "Asamyukta Hasta",
        "description": "In Ardhapataka gesture, the index finger and middle finger are separated wide apart forming a 'V' shape, while ring and pinky are held down by thumb.",
        "pose_guidance": "Form a wide 'V' shape with index and middle fingers (peace/scissors sign). Hold ring and pinky down with your thumb.",
        "icon": "scissors",
        "color": "#ec4899",  # Pink
        "sloka_reference": "Abhinaya Darpana: 'Streepumsayostu vishleshe viparyasapade pi va...'"
    },
    "Mayura": {
        "id": "mayura",
        "name": "Mayura",
        "sanskrit": "मयूर",
        "meaning": "Peacock / Tilak / Creeper / Grace",
        "category": "Asamyukta Hasta",
        "description": "The tip of the ring finger joins the tip of the thumb forming a loop/circle, while index, middle, and pinky fingers remain extended straight.",
        "pose_guidance": "Touch the tip of your ring finger to the tip of your thumb. Keep index, middle, and pinky fingers standing straight.",
        "icon": "sparkles",
        "color": "#10b981",  # Emerald
        "sloka_reference": "Abhinaya Darpana: 'Mayurasyasye vamane tilake chaiva lekhane...'"
    },
    "Ardhachandra": {
        "id": "ardhachandra",
        "name": "Ardhachandra",
        "sanskrit": "अर्धचन्द्र",
        "meaning": "Crescent Moon / Consecration / Bow",
        "category": "Asamyukta Hasta",
        "description": "Form Pataka mudra, then extend the thumb outwards away from the palm as far as possible, resembling the crescent moon.",
        "pose_guidance": "Keep all four fingers straight and pressed together. Stretch your thumb outward as far as possible forming an 'L' / crescent curve.",
        "icon": "moon",
        "color": "#f59e0b",  # Amber
        "sloka_reference": "Abhinaya Darpana: 'Chandre tarabhidhe patre hyashuchau deshabhedane...'"
    },
    "Mushti": {
        "id": "mushti",
        "name": "Mushti",
        "sanskrit": "मुष्टि",
        "meaning": "Fist / Grasping / Courage / Wrestling",
        "category": "Asamyukta Hasta",
        "description": "All four fingers are curled tightly into the center of the palm, and the thumb is held tightly over them across the fingers.",
        "pose_guidance": "Roll all four fingers tightly into your palm, wrapping your thumb firmly over the fingers into a solid fist.",
        "icon": "shield",
        "color": "#ef4444",  # Red
        "sloka_reference": "Abhinaya Darpana: 'Stheerye kachagrahe darpe dharane yuddhabhavane...'"
    },
    "Shikhara": {
        "id": "shikhara",
        "name": "Shikhara",
        "sanskrit": "शिखर",
        "meaning": "Peak / Spire / Bow of Kama / Shiva Lingam",
        "category": "Asamyukta Hasta",
        "description": "Form Mushti (fist), then extend the thumb vertically upright pointing straight to the sky like a temple spire.",
        "pose_guidance": "Make a fist with your four fingers curled into the palm, but extend your thumb straight up like a thumbs-up gesture.",
        "icon": "mountain",
        "color": "#14b8a6",  # Teal
        "sloka_reference": "Abhinaya Darpana: 'Madane karmuke stambhe nishchaye pitritarpane...'"
    }
}

MUDRAS_LIST: List[Dict[str, Any]] = list(MUDRAS_CATALOG.values())
TARGET_MUDRA_NAMES: List[str] = [m["name"] for m in MUDRAS_LIST]
