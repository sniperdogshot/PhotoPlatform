from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.models import User, Photo, Album

from app.routers.auth import router as auth_router
from app.routers.photos import router as photos_router
from app.routers.albums import router as albums_router
from app.routers.public import router as public_router


app = FastAPI(
    title="PhotoPlatform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(photos_router)
app.include_router(albums_router)
app.include_router(public_router)

@app.get("/")
def root():
    return {
        "message": "PhotoPlatform API funcionando"
    }


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }

    except Exception as error:
        return {
            "status": "error",
            "database": "disconnected",
            "detail": str(error),
        }
