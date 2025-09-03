from pydantic import BaseModel
from typing import List, Optional

class Offer(BaseModel):
    title: str
    price: Optional[float]
    currency: str = "PLN"
    merchant: str
    url: str
    image: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    offers: List[Offer]
