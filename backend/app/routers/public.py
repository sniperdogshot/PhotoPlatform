from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.album import Album
from app.models.photo import Photo
from app.schemas.public_album import (
    PublicAlbumResponse,
    PublicPhotoResponse,
)


router = APIRouter(
    prefix="/public",
    tags=["Public"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/albums/{album_id}",
    response_model=PublicAlbumResponse,
)
def get_public_album(
    album_id: int,
    db: Session = Depends(get_db),
):
    album = (
        db.query(Album)
        .filter(Album.id == album_id)
        .first()
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album nao encontrado",
        )

    photos = (
        db.query(Photo)
        .filter(Photo.album_id == album.id)
        .order_by(Photo.created_at.desc())
        .all()
    )

    return {
        "id": album.id,
        "name": album.name,
        "photos": [
            PublicPhotoResponse(
                id=photo.id,
                filename=photo.filename,
                created_at=photo.created_at,
                preview_url=f"/public/photos/{photo.id}/preview",
            )
            for photo in photos
        ],
    }


@router.get(
    "/photos/{photo_id}/preview",
)
def get_public_photo_preview(
    photo_id: int,
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Foto nao encontrada",
        )

    return FileResponse(
        photo.preview_path,
        media_type="image/jpeg",
    )
  
@router.get(
    "/photos/{photo_id}/original",
)
def get_public_photo_original(
    photo_id: int,
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Foto nao encontrada",
        )

    return FileResponse(
        photo.original_path,
        media_type="image/jpeg",
        filename=photo.filename,
    )  
    
