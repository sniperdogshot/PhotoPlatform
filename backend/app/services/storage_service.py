from pathlib import Path
from uuid import uuid4

from PIL import Image


BASE_DIR = Path(__file__).resolve().parent.parent.parent

STORAGE_DIR = BASE_DIR / "storage"

ORIGINALS_DIR = STORAGE_DIR / "originals"
PREVIEWS_DIR = STORAGE_DIR / "previews"

ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)


def save_original(
    file_bytes: bytes,
    extension: str,
) -> tuple[str, str]:

    filename = f"{uuid4().hex}{extension}"

    file_path = ORIGINALS_DIR / filename

    file_path.write_bytes(file_bytes)

    return filename, str(file_path)


def create_preview(
    original_path: str,
    filename: str,
) -> str:

    preview_path = PREVIEWS_DIR / filename

    with Image.open(original_path) as image:

        image.thumbnail((800, 800))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        image.save(
            preview_path,
            "JPEG",
            quality=85,
        )

    return str(preview_path)
