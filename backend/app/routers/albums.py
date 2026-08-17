from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.album import Album
from app.models.user import User
from app.schemas.album import AlbumCreate, AlbumResponse
from app.routers.auth import get_current_user
from app.services.album_service import (
    create_album,
    delete_album as delete_album_service,
)


router = APIRouter(
    prefix="/albums",
    tags=["Albums"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=AlbumResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    album_data: AlbumCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        album = create_album(
            db=db,
            name=album_data.name,
            owner_id=current_user.id,
        )

        return album

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get(
    "/",
    response_model=list[AlbumResponse],
)
def list_albums(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Album)
        .filter(Album.owner_id == current_user.id)
        .order_by(Album.id.desc())
        .all()
    )


@router.get(
    "/{album_id}",
    response_model=AlbumResponse,
)
def get_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    album = (
        db.query(Album)
        .filter(
            Album.id == album_id,
            Album.owner_id == current_user.id,
        )
        .first()
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album nao encontrado",
        )

    return album


@router.delete(
    "/{album_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    album = (
        db.query(Album)
        .filter(
            Album.id == album_id,
            Album.owner_id == current_user.id,
        )
        .first()
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album nao encontrado",
        )

    delete_album_service(
        db=db,
        album=album,
    )

    return None
