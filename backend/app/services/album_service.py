from sqlalchemy.orm import Session

from app.models.album import Album


def create_album(
    db: Session,
    name: str,
    owner_id: int,
) -> Album:

    name = name.strip()

    if not name:
        raise ValueError(
            "Nome do album nao pode ser vazio"
        )

    album = Album(
        name=name,
        owner_id=owner_id,
    )

    db.add(album)
    db.commit()
    db.refresh(album)

    return album


def delete_album(
    db: Session,
    album: Album,
) -> None:

    db.delete(album)
    db.commit()
