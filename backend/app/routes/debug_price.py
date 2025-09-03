# app/routes/debug_price.py
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from app.utils.product_page_prices import _get, _norm_price
from bs4 import BeautifulSoup
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import re

router = APIRouter(prefix="/debug", tags=["debug"])

class Peek(BaseModel):
    url: str
    html_len: int
    me_aria: Optional[str] = None
    me_whole: Optional[str] = None
    me_rest: Optional[str] = None
    first_near_zl: Optional[str] = None
    detected_price: Optional[float] = None
    final_url: Optional[str] = None

def _clean_url(u: str) -> str:
    parts = urlsplit(u)
    q = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
         if k.lower() not in {"gclid", "gbraid", "gad_source", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"}]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(q), parts.fragment))

@router.get("/peek", response_model=Peek)
def peek(url: str = Query(...)):
    html, final = _get(url)
    html = html or ""
    s = BeautifulSoup(html, "html.parser")

    out = Peek(url=url, html_len=len(html), final_url=final)

    # ME: aria-label w kontenerze ceny
    aria = s.select_one('div[data-name="productPrice"] [aria-label*="Cena"]')
    if aria:
        out.me_aria = aria.get("aria-label")

    whole = s.select_one("span.whole")
    rest  = s.select_one("span.rest")
    out.me_whole = whole.get_text(strip=True) if whole else None
    out.me_rest  = rest.get_text(strip=True) if rest else None

    # regex po TEKŚCIE strony (nie po HTML)
    page_text = s.get_text(" ", strip=True)
    m = re.search(r'([0-9 \u00A0.,]{2,})\s*(?:zł|PLN)', page_text, flags=re.I)
    if m:
        out.first_near_zl = m.group(1).strip()

    # wykalkuluj detected_price
    for cand in (out.me_aria,
                 (f"{out.me_whole},{out.me_rest}" if out.me_whole and out.me_rest else out.me_whole),
                 out.first_near_zl):
        p = _norm_price(cand or "")
        if p is not None:
            out.detected_price = p
            break

    return out
