from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_audio_key(text: str, lang: str) -> str:
    return f"{lang}:{text.strip().lower()}"