from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255), nullable=False)

    original_path = Column(String(255), nullable=False)

    preview_path = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))

    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)

    owner = relationship("User", back_populates="photos")

    album = relationship("Album", back_populates="photos")
