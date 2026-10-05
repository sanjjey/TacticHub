import os
import re
from typing import Dict, Any, List
from deep_translator import MyMemoryTranslator

# Supported Language Taxonomy
SUPPORTED_LANGUAGES = [
    {"code": "english", "name": "English", "flag": "🇬🇧"},
    {"code": "spanish", "name": "Spanish", "flag": "🇪🇸"},
    {"code": "french", "name": "French", "flag": "🇫🇷"},
    {"code": "german", "name": "German", "flag": "🇩🇪"},
    {"code": "italian", "name": "Italian", "flag": "🇮🇹"},
    {"code": "portuguese", "name": "Portuguese", "flag": "🇵🇹"},
    {"code": "hindi", "name": "Hindi", "flag": "🇮🇳"},
    {"code": "tamil", "name": "Tamil", "flag": "🇮🇳"},
    {"code": "japanese", "name": "Japanese", "flag": "🇯🇵"},
    {"code": "chinese simplified", "name": "Chinese", "flag": "🇨🇳"},
    {"code": "arabic", "name": "Arabic", "flag": "🇸🇦"},
]

# Tactical sports enhancement glossary for offline heuristic improver
TACTICAL_VOCABULARY = [
    (r"\brun fast to get ball\b", "rapid counter-press to recover possession immediately"),
    (r"\bpass ball long\b", "execute diagonal switches into open channels"),
    (r"\bgood defense\b", "compact defensive structure and disciplined positional marking"),
    (r"\bkick hard\b", "strike through the ball with power and precision"),
    (r"\brun back\b", "track back and establish defensive recovery lines"),
    (r"\bwe need players\b", "recruiting committed athletes to complete our match roster"),
    (r"\bstand in front\b", "set high ball-screens to create driving lanes"),
    (r"\bplay good\b", "deliver a disciplined, high-tempo athletic performance"),
    (r"\bkick ball\b", "distribute the ball with deliberate pace"),
    (r"\bdont let them shoot\b", "close down shooting lanes and contest perimeter attempts aggressively"),
    (r"\bthrow high\b", "deliver lofted passes into targeted attacking zones"),
    (r"\bwin match\b", "secure a tactical victory through superior execution"),
    (r"\bi want to invite you\b", "pleased to extend a formal invitation for a trial with our academy"),
    (r"\bwe play today\b", "scheduled match fixture taking place today"),
    (r"\bbring shoes\b", "standard sports footwear / cleats required for play"),
]

def clean_and_capitalize(text: str) -> str:
    """Fix casing, punctuation, and structural flow."""
    # Strip unnecessary spaces
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return text

    # Capitalize after periods
    sentences = re.split(r"([.!?]\s*)", text)
    capitalized = ""
    for s in sentences:
        if s and not re.match(r"^[.!?]\s*$", s):
            capitalized += s[0].upper() + s[1:]
        else:
            capitalized += s

    # Ensure ends with punctuation
    if capitalized and capitalized[-1] not in ".!?":
        capitalized += "."

    return capitalized


class SportsTextAnalyzer:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")

    def improvise_english(self, text: str, context: str = "tactics") -> Dict[str, Any]:
        """
        Improvises the English of sports posts:
        - Grammar polish, active voice, professional coaching tone.
        - Tries LLM if API key available, else utilizes semantic tactical enhancer.
        """
        text = text.strip()
        if not text:
            return {"original": text, "improvised": text, "improvements": []}

        # 1. Check for LLM API integration if configured
        if self.openai_key or self.gemini_key:
            try:
                import litellm
                prompt = (
                    f"You are a professional sports coach and tactical analyst editor. "
                    f"Improvise and elevate the following sports {context} text. Improve grammar, "
                    f"structure, and athletic vocabulary while preserving original tactical intent.\n\n"
                    f"Text:\n{text}\n\n"
                    f"Return ONLY the improved text without conversational preamble."
                )
                model = "gpt-4o-mini" if self.openai_key else "gemini/gemini-1.5-flash"
                resp = litellm.completion(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=350,
                    temperature=0.3
                )
                improvised = resp.choices[0].message.content.strip()
                return {
                    "original": text,
                    "improvised": improvised,
                    "method": "LLM_NEURAL",
                    "improvements": ["Elevated tactical phrasing", "Grammar & flow correction", "Professional tone applied"]
                }
            except Exception as e:
                print(f"[TextAnalyzer] LLM error, falling back to local enhancer: {e}")

        # 2. Local rule-based & tactical terminology enhancer
        improved = text
        applied_improvements = []

        # Apply tactical replacements
        for pattern, replacement in TACTICAL_VOCABULARY:
            if re.search(pattern, improved, flags=re.IGNORECASE):
                improved = re.sub(pattern, replacement, improved, flags=re.IGNORECASE)
                applied_improvements.append(f"Enhanced phrasing: '{replacement}'")

        # Fix capitalization and punctuation
        enhanced = clean_and_capitalize(improved)
        if enhanced != text and not applied_improvements:
            applied_improvements.append("Refined sentence boundaries and capitalization")

        if not applied_improvements:
            applied_improvements.append("Enhanced clarity and structured syntax")

        return {
            "original": text,
            "improvised": enhanced,
            "method": "LOCAL_TACTICAL_AI",
            "improvements": applied_improvements
        }

    def translate(self, text: str, target_lang: str, source_lang: str = "english") -> Dict[str, Any]:
        """
        Translates content between supported languages.
        """
        text = text.strip()
        if not text:
            return {"original": text, "translated": text, "target_lang": target_lang}

        target_normalized = target_lang.lower().strip()
        source_normalized = source_lang.lower().strip() if source_lang else "english"

        # If already matching
        if target_normalized == source_normalized:
            return {"original": text, "translated": text, "target_lang": target_lang}

        # 1. Try LLM translation if key exists
        if self.openai_key or self.gemini_key:
            try:
                import litellm
                prompt = (
                    f"Translate the following sports strategy/content accurately from {source_normalized} "
                    f"to {target_normalized}. Maintain sports tactical context.\n\n"
                    f"Content:\n{text}\n\n"
                    f"Return ONLY the direct translation."
                )
                model = "gpt-4o-mini" if self.openai_key else "gemini/gemini-1.5-flash"
                resp = litellm.completion(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=400,
                    temperature=0.2
                )
                translated = resp.choices[0].message.content.strip()
                return {
                    "original": text,
                    "translated": translated,
                    "target_lang": target_normalized,
                    "provider": "LLM_NEURAL"
                }
            except Exception as e:
                print(f"[TextAnalyzer] LLM translate failed, fallback to DeepTranslator: {e}")

        # 2. Try MyMemoryTranslator
        try:
            translator = MyMemoryTranslator(source=source_normalized, target=target_normalized)
            translated = translator.translate(text)
            return {
                "original": text,
                "translated": translated,
                "target_lang": target_normalized,
                "provider": "MYMEMORY_TRANSLATOR"
            }
        except Exception as e:
            print(f"[TextAnalyzer] MyMemory translation error: {e}")
            # Graceful fallback: return original text with notification
            return {
                "original": text,
                "translated": text,
                "target_lang": target_normalized,
                "provider": "FALLBACK",
                "note": "Translation service temporarily unreachable."
            }

text_analyzer = SportsTextAnalyzer()
