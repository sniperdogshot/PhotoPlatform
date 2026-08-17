from pathlib import Path

from sqlalchemy.orm import Session

from app.models.photo import Photo
from app.models.album import Album

from app.services.storage_service import (
    save_original,
    create_preview,
)


def create_photo(
    db: Session,
    file_bytes: bytes,
    filename: str,
    owner_id: int,
    album_id: int,
) -> Photo:

    album = (
        db.query(Album)
        .filter(
            Album.id == album_id,
            Album.owner_id == owner_id,
        )
        .first()
    )

    if not album:
        raise ValueError(
            "Album nao encontrado"
        )

    extension = Path(filename).suffix.lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    if extension not in allowed_extensions:
        raise ValueError(
            "Formato de imagem nao permitido"
        )

    saved_filename, original_path = save_original(
        file_bytes=file_bytes,
        extension=extension,
    )

    preview_filename = (
        Path(saved_filename).stem + ".jpg"
    )

    preview_path = create_preview(
        original_path=original_path,
        filename=preview_filename,
    )

    photo = Photo(
        filename=filename,
        original_path=original_path,
        preview_path=preview_path,
        owner_id=owner_id,
        album_id=album_id,
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


def delete_photo(
    db: Session,
    photo: Photo,
) -> None:

    original_path = Path(photo.original_path)
    preview_path = Path(photo.preview_path)

    if original_path.exists():
        original_path.unlink()

    if preview_path.exists():
        preview_path.unlink()

    db.delete(photo)
    db.commit()
