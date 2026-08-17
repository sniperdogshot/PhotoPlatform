from datetime import datetime

from pydantic import BaseModel


class PhotoResponse(BaseModel):
    id: int
    filename: str
    created_at: datetime
    owner_id: int
    album_id: int | None
    preview_url: str
    original_url: str
