from sqlalchemy import Integer, String, Boolean, Text, DateTime, func, ForeignKey, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from sqlalchemy.ext.hybrid import hybrid_property
from typing import Optional, List
from datetime import datetime

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    subtitle: Mapped[Optional[str]] = mapped_column(String(300))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    tags: Mapped[str] = mapped_column(String(400), default="")
    author_id: Mapped[int] = mapped_column(Integer, index=True)
    author_name: Mapped[str] = mapped_column(String(120))
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.getutcdate())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.getutcdate(), onupdate=func.getutcdate())

    # relations
    images: Mapped[List["ImageAsset"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    sections: Mapped[List["PostSection"]] = relationship(back_populates="post", cascade="all, delete-orphan", order_by="PostSection.order_index")

    @hybrid_property
    def hero_image_url(self) -> Optional[str]:
        for img in self.images or []:
            if img.is_hero:
                return f"/Admin/posts/{self.id}/images/{img.id}"
        return None

    @hybrid_property
    def gallery_urls(self) -> List[str]:
        return [f"/Admin/posts/{self.id}/images/{img.id}" for img in (self.images or []) if not img.is_hero]

class ImageAsset(Base):
    __tablename__ = "post_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    is_hero: Mapped[bool] = mapped_column(Boolean, default=False)
    content_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    data: Mapped[bytes] = mapped_column(LargeBinary)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.getutcdate())

    post: Mapped["Post"] = relationship(back_populates="images")

class PostSection(Base):
    __tablename__ = "post_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer) # 1..N
    heading: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    text: Mapped[str] = mapped_column(Text) # required
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.getutcdate())

    post: Mapped["Post"] = relationship(back_populates="sections")