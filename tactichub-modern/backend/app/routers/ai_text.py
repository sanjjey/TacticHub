from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..text_analyzer import text_analyzer, SUPPORTED_LANGUAGES

router = APIRouter(prefix="/api/ai", tags=["AI Text Analyzer"])

class ImproviseRequest(BaseModel):
    text: str
    context: Optional[str] = "tactics"

class ImproviseResponse(BaseModel):
    original: str
    improvised: str
    method: str
    improvements: List[str]

class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "english"

class TranslateResponse(BaseModel):
    original: str
    translated: str
    target_lang: str
    provider: str
    note: Optional[str] = None

class ModerateRequest(BaseModel):
    title: str
    description: str
    game: Optional[str] = "Sports"

class ModerateResponse(BaseModel):
    allowed: bool
    status: str
    message: str
    relevance_score: Optional[float] = None

@router.post("/moderate", response_model=ModerateResponse)
def moderate_content(req: ModerateRequest):
    from ..moderator import content_moderator
    result = content_moderator.moderate_tactic(
        title=req.title,
        description=req.description,
        game=req.game or "Sports"
    )
    return result

@router.post("/improvise", response_model=ImproviseResponse)
def improvise_english(req: ImproviseRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    result = text_analyzer.improvise_english(req.text, context=req.context or "tactics")
    return result

@router.post("/translate", response_model=TranslateResponse)
def translate_content(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    result = text_analyzer.translate(req.text, target_lang=req.target_lang, source_lang=req.source_lang or "english")
    return result

@router.get("/languages")
def get_languages():
    return SUPPORTED_LANGUAGES
