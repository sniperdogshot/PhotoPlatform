from datetime import datetime

from pydantic import BaseModel


class PublicPhotoResponse(BaseModel):
    id: int
    filename: str
    created_at: datetime
    preview_url: str


class PublicAlbumResponse(BaseModel):
    id: int
    name: str
    photos: list[PublicPhotoResponse]
