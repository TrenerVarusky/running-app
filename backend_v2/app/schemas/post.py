from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from pydantic.config import ConfigDict


class SectionIn(BaseModel):
    heading: Optional[str] = Field(None, max_length=200)
    text: str = Field(..., min_length=1)


class SectionOut(BaseModel):
    heading: Optional[str] = None
    text: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    subtitle: Optional[str] = None
    slug: str
    # content removed; expose sections instead
    sections: List[SectionOut] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    author_id: int
    author_name: str
    published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    hero_image_url: Optional[str] = None
    gallery_urls: List[str] = Field(default_factory=list)


    @field_validator("tags", mode="before")
    @classmethod
    def normalize_tags_out(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if isinstance(v, (list, tuple, set)):
            return list(v)
        return []