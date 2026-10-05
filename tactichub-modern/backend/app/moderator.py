import re
import math
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1. NSFW, Toxic & Inappropriate Word Filter (Regex with word boundaries & evasion normalization)
NSFW_PATTERNS = [
    r"\b(fuck|fucker|fucking|f\*ck|f\*\*k|shit|sh\*t|bitch|b\*tch|asshole|a\*\*hole)\b",
    r"\b(dick|pussy|cock|cunt|tits|boobs|porn|porno|xxx|nsfw|nude|nudes|sex|sexy)\b",
    r"\b(bastard|slut|whore|nigger|nigga|faggot|retard|kill yourself|kys|suicide)\b",
    r"\b(casino|viagra|cialis|crypto scam|free money|whatsapp sex)\b",
]

# 2. Sports Tactical Reference Corpus (Benchmark for semantic relevance model)
SPORTS_TACTICAL_CORPUS = [
    "defensive formation and compact block with disciplined positional marking",
    "offensive movement counter-attack transition and passing combinations in space",
    "high press gegenpressing recover ball possession and trigger traps",
    "pick and roll screen action perimeter shooting and defensive switches",
    "goalkeeper distribution sweeping long diagonal ball into open channels",
    "midfield overload triangle passing dribbling and wing-back overlaps",
    "set piece routine corner kick direct free kick zonal defending",
    "tactical drill training fitness endurance match preparation play",
    "badminton footwork court coverage drop shot smash and smash return",
    "tennis serve volley baseline rally topspin backhand slice court positioning",
    "cricket bowling line and length field placement powerplay batting approach",
    "basketball fast break transition spacing box out rebound and help defense",
    "athletic coordination physical speed conditioning team chemistry strategy"
]

class SportsContentModerator:
    def __init__(self):
        # Initialize TF-IDF model fitted on sports tactical taxonomy
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.reference_matrix = self.vectorizer.fit_transform(SPORTS_TACTICAL_CORPUS)

    def check_nsfw_toxicity(self, text: str) -> Dict[str, Any]:
        """Scans for profanity, sexual content, slurs, and abusive terms."""
        normalized = text.lower()
        # Normalize simple character substitutions
        normalized = re.sub(r"[@4]", "a", normalized)
        normalized = re.sub(r"[\$5]", "s", normalized)
        normalized = re.sub(r"[!1|]", "i", normalized)
        normalized = re.sub(r"[0]", "o", normalized)

        for pattern in NSFW_PATTERNS:
            match = re.search(pattern, normalized, flags=re.IGNORECASE)
            if match:
                return {
                    "is_safe": False,
                    "reason": f"Prohibited word/phrase detected: '{match.group(0)}'",
                    "flag_type": "NSFW_PROFANITY"
                }

        return {"is_safe": True, "reason": None}

    def check_gibberish_and_nonsense(self, text: str) -> Dict[str, Any]:
        """Detects keyboard mashing, repeated characters, and structural nonsense."""
        clean = text.strip()
        if len(clean) < 8:
            return {"is_valid": False, "reason": "Text is too short to be a valid sports strategy."}

        # Check for excessive character repetition (e.g. "aaaaaaa", "asdfasdfasdf")
        if re.search(r"(.)\1{4,}", clean):
            return {"is_valid": False, "reason": "Contains nonsensical repeating characters."}

        # Check for repetitive random keyboard sequences
        if re.search(r"(asdf|qwerty|zxcv|12345|ghjkl)", clean, flags=re.IGNORECASE):
            # If large proportion is keyboard mash
            if len(clean) < 30:
                return {"is_valid": False, "reason": "Detected keyboard smash / nonsensical input."}

        # Check word validity ratio (average word length check)
        words = clean.split()
        if not words:
            return {"is_valid": False, "reason": "No meaningful words provided."}

        avg_word_length = sum(len(w) for w in words) / len(words)
        if avg_word_length > 18:
            return {"is_valid": False, "reason": "Text contains unnatural non-word sequences."}

        # Vowel to consonant ratio check
        letters = re.findall(r"[a-zA-Z]", clean)
        if letters:
            vowels = len(re.findall(r"[aeiouAEIOU]", clean))
            vowel_ratio = vowels / len(letters)
            if vowel_ratio < 0.12 or vowel_ratio > 0.85:
                return {"is_valid": False, "reason": "Nonsensical word composition detected."}

        return {"is_valid": True, "reason": None}

    def check_tactical_relevance(self, title: str, description: str, game: str) -> Dict[str, Any]:
        """
        Calculates cosine similarity against sports tactical anchor representations
        using TF-IDF sentence model.
        """
        combined = f"{game} {title} {description}"

        try:
            input_vector = self.vectorizer.transform([combined])
            # Cosine similarity against reference tactical corpus
            similarities = cosine_similarity(input_vector, self.reference_matrix)[0]
            max_sim = float(similarities.max())
            mean_sim = float(similarities.mean())

            # Sports keyword fallback check
            sports_kw = [
                "defense", "attack", "pass", "run", "formation", "drill", "shoot", "ball",
                "court", "field", "pitch", "goal", "line", "coach", "tactic", "strategy",
                "player", "zone", "press", "marking", "space", "block", "team", "match",
                "counter", "cross", "serve", "smash", "wicket", "basket", "wing", "game"
            ]
            has_sports_terms = any(kw in combined.lower() for kw in sports_kw)

            # Combined relevance threshold
            # If TF-IDF cosine similarity is very low and zero sports keywords present
            if max_sim < 0.04 and not has_sports_terms:
                return {
                    "is_relevant": False,
                    "score": round(max_sim, 3),
                    "reason": "Content is off-topic or lacks athletic / sports tactical relevance."
                }

            return {
                "is_relevant": True,
                "score": round(max_sim, 3),
                "reason": "Content verified as sports tactical strategy."
            }
        except Exception as e:
            # Fallback permissive if vectorizer fails
            return {"is_relevant": True, "score": 1.0, "reason": str(e)}

    def moderate_tactic(self, title: str, description: str, game: str = "Sports") -> Dict[str, Any]:
        """
        Unified gatekeeper:
        1. NSFW / Toxicity check
        2. Nonsense / Gibberish check
        3. Lightweight Sentence Model Relevance check
        """
        # 1. NSFW check
        title_nsfw = self.check_nsfw_toxicity(title)
        if not title_nsfw["is_safe"]:
            return {"allowed": False, "status": "REJECTED_NSFW", "message": f"Strategy title rejected: {title_nsfw['reason']}"}

        desc_nsfw = self.check_nsfw_toxicity(description)
        if not desc_nsfw["is_safe"]:
            return {"allowed": False, "status": "REJECTED_NSFW", "message": f"Strategy description rejected: {desc_nsfw['reason']}"}

        # 2. Nonsense check
        title_nonsense = self.check_gibberish_and_nonsense(title)
        if not title_nonsense["is_valid"]:
            return {"allowed": False, "status": "REJECTED_NONSENSE", "message": f"Title rejected: {title_nonsense['reason']}"}

        desc_nonsense = self.check_gibberish_and_nonsense(description)
        if not desc_nonsense["is_valid"]:
            return {"allowed": False, "status": "REJECTED_NONSENSE", "message": f"Description rejected: {desc_nonsense['reason']}"}

        # 3. Semantic Relevance check
        relevance = self.check_tactical_relevance(title, description, game)
        if not relevance["is_relevant"]:
            return {
                "allowed": False,
                "status": "REJECTED_IRRELEVANT",
                "message": "Strategy rejected: Content appears irrelevant or nonsense. Please post genuine sports tactics, formations, or drills."
            }

        return {
            "allowed": True,
            "status": "APPROVED",
            "message": "Content verified as safe and tactically relevant.",
            "relevance_score": relevance.get("score", 1.0)
        }

content_moderator = SportsContentModerator()
