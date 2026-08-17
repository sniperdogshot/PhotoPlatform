from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.photo import Photo
from app.models.user import User
from app.schemas.photo import PhotoResponse

from app.routers.auth import get_current_user

from app.services.photo_service import (
    create_photo,
    delete_photo as delete_photo_service,
)


router = APIRouter(
    prefix="/photos",
    tags=["Photos"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def photo_to_response(photo: Photo) -> dict:
    return {
        "id": photo.id,
        "filename": photo.filename,
        "created_at": photo.created_at,
        "owner_id": photo.owner_id,
        "album_id": photo.album_id,
        "preview_url": f"/photos/{photo.id}/preview",
        "original_url": f"/photos/{photo.id}/original",
    }


@router.post(
    "/upload",
    response_model=PhotoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_photo(
    album_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo invalido",
        )

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Apenas JPG, PNG e WEBP sao permitidos",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio",
        )

    try:
        photo = create_photo(
            db=db,
            file_bytes=file_bytes,
            filename=file.filename or "image",
            owner_id=current_user.id,
            album_id=album_id,
        )

        return photo_to_response(photo)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get(
    "/album/{album_id}",
    response_model=list[PhotoResponse],
)
def list_album_photos(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photos = (
        db.query(Photo)
        .filter(
            Photo.album_id == album_id,
            Photo.owner_id == current_user.id,
        )
        .order_by(Photo.created_at.desc())
        .all()
    )

    return [
        photo_to_response(photo)
        for photo in photos
    ]


@router.get(
    "/{photo_id}/preview",
)
def get_photo_preview(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(
            Photo.id == photo_id,
            Photo.owner_id == current_user.id,
        )
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
    "/{photo_id}/original",
)
def get_photo_original(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(
            Photo.id == photo_id,
            Photo.owner_id == current_user.id,
        )
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


@router.get(
    "/",
    response_model=list[PhotoResponse],
)
def list_photos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photos = (
        db.query(Photo)
        .filter(
            Photo.owner_id == current_user.id
        )
        .order_by(Photo.created_at.desc())
        .all()
    )

    return [
        photo_to_response(photo)
        for photo in photos
    ]


@router.get(
    "/{photo_id}",
    response_model=PhotoResponse,
)
def get_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(
            Photo.id == photo_id,
            Photo.owner_id == current_user.id,
        )
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Foto nao encontrada",
        )

    return photo_to_response(photo)


@router.delete(
    "/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = (
        db.query(Photo)
        .filter(
            Photo.id == photo_id,
            Photo.owner_id == current_user.id,
        )
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Foto nao encontrada",
        )

    delete_photo_service(
        db=db,
        photo=photo,
    )

    return None
