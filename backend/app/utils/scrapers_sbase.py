# app/utils/scrapers_sbase.py
from dataclasses import dataclass
from typing import List, Optional, Dict, Callable
from bs4 import BeautifulSoup
from app.utils.sb_fetch import get_html
import urllib.parse
import re
import requests  # fallback: szybkie pobranie strony produktu

# --------- helpers ---------
PRICE_RE = re.compile(r"([0-9]+[\s\u00A0]?[0-9]*[\,\.]?[0-9]{0,2})")

def _price(text: str) -> Optional[float]:
    if not text:
        return None
    m = PRICE_RE.search(text.replace("\xa0", " "))
    if not m:
        return None
    try:
        return float(m.group(1).replace(" ", "").replace(",", "."))
    except ValueError:
        return None

def _price_from_text(el) -> Optional[float]:
    return _price(el.get_text(" ", strip=True)) if el else None

def _fetch_price_from_product(url: str) -> Optional[float]:
    """Lekki fallback: pobiera stronę produktu zwykłym requests i wyciąga cenę."""
    try:
        r = requests.get(
            url,
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "pl-PL,pl;q=0.9"},
        )
        if r.status_code != 200:
            return None
        s = BeautifulSoup(r.text, "html.parser")

        # Morele: #product_price ma zwykle data-price
        el = s.select_one("#product_price")
        if el and el.get("data-price"):
            p = _price(el.get("data-price"))
            if p is not None:
                return p

        # Inne ogólne miejsca
        for cand in (
            s.select_one('meta[itemprop="price"]'),
            s.select_one('span[itemprop="price"]'),
            s.select_one("div.price span"),
            s.select_one("span.price"),
        ):
            if not cand:
                continue
            txt = cand.get("content") or cand.get("data-price") or cand.get_text(strip=True)
            p = _price(txt)
            if p is not None:
                return p
    except Exception:
        return None
    return None

# --------- model ---------
@dataclass
class ProductOffer:
    title: str
    price: Optional[float]
    currency: str
    merchant: str
    url: str
    image: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None

# ======================
# Media Expert
# ======================
def scrape_media_expert(q: str) -> List[ProductOffer]:
    url = "https://www.mediaexpert.pl/search?query=" + urllib.parse.quote(q)
    html = get_html(url, wait_css="div.listing-wrapper, div.listing, body", timeout_ms=9000)
    soup = BeautifulSoup(html, "html.parser")

    items: List[ProductOffer] = []
    cards = (
        soup.select("div.offer-box")
        or soup.select("div.listing-item")
        or soup.select("div[data-product-id]")
    )
    for card in cards[:12]:
        title_el = card.select_one("a.is-choose-product, a.name, a.product-name, a[href^='/']")
        if not title_el:
            continue

        # --- różne warianty ceny na listingu ---
        price = None
        # proste pola
        price = price or _price_from_text(card.select_one("span.whole"))
        price = price or _price_from_text(card.select_one("span.price"))
        price = price or _price_from_text(card.select_one("span.actual-price"))
        price = price or _price_from_text(card.select_one("div.price__main"))

        # wariant rozbity: <strong>1 061</strong><small>,24 zł</small>
        if price is None:
            whole = card.select_one("strong")
            frac = card.select_one("small")
            if whole:
                txt = (whole.get_text(strip=True) or "") + " " + (frac.get_text(strip=True) if frac else "")
                price = _price(txt)

        title = title_el.get("title") or title_el.get_text(strip=True)
        link = (title_el.get("href") or "").strip()
        if link.startswith("/"):
            link = "https://www.mediaexpert.pl" + link

        # fallback: strona produktu
        if price is None:
            price = _fetch_price_from_product(link)

        img_el = card.select_one("img")
        img = (img_el.get("data-src") or img_el.get("src")) if img_el else None
        items.append(ProductOffer(title, price, "PLN", "Media Expert", link, img))
    return items

# ======================
# x-kom
# ======================
def scrape_xkom(q: str) -> List[ProductOffer]:
    url = "https://www.x-kom.pl/szukaj?q=" + urllib.parse.quote(q)
    html = get_html(url, wait_css="div.sc-1yu46qn-6, div[data-name='productCard'], body", timeout_ms=8000)
    soup = BeautifulSoup(html, "html.parser")

    items: List[ProductOffer] = []
    cards = soup.select("div.sc-1yu46qn-6") or soup.select("div[data-name='productCard']") or soup.select("div.product-item")
    for card in cards[:12]:
        title_el = card.select_one("a.sc-1h16fat-0, a[href^='/p/']")
        if not title_el:
            continue
        price_el = card.select_one("span.sc-6n68ef-0, span.price, div[data-name='price']") or card.find(attrs={"data-name": "price"})
        img_el = card.select_one("img")

        title = title_el.get_text(strip=True)
        link = (title_el.get("href") or "").strip()
        if link.startswith("/"):
            link = "https://www.x-kom.pl" + link
        price = _price(price_el.get_text(" ", strip=True) if price_el else "")
        img = img_el.get("src") if img_el else None

        items.append(ProductOffer(title, price, "PLN", "x-kom", link, img))
    return items

# ======================
# Morele
# ======================
def scrape_morele(q: str) -> List[ProductOffer]:
    url = "https://www.morele.net/wyszukiwarka/?q=" + urllib.parse.quote(q)
    html = get_html(url, wait_css="div.cat-list-products, div.listing-products, body", timeout_ms=9000)
    soup = BeautifulSoup(html, "html.parser")

    items: List[ProductOffer] = []
    cards = (
        soup.select("div.cat-list-products div.product")
        or soup.select("div.listing-product")
        or soup.select("div[data-product-id]")
    )
    for card in cards[:12]:
        title_el = card.select_one("a.productLink, a.prod-name, a[href^='/']")
        if not title_el:
            continue

        title = title_el.get("title") or title_el.get_text(strip=True)
        link = (title_el.get("href") or "").strip()
        if link.startswith("/"):
            link = "https://www.morele.net" + link

        img_el = card.select_one("img")
        img = (img_el.get("data-src") or img_el.get("src")) if img_el else None

        # --- 1) preferuj atrybuty data-* (najpewniejsze na Morele) ---
        price: Optional[float] = None
        for attr in ("data-price", "data-product-price", "data-default", "data-default-price-gross"):
            if card.has_attr(attr):
                price = _price(card.get(attr))
                if price is not None:
                    break

        # --- 2) typowe pola tekstowe na listingu ---
        if price is None:
            for sel in ("span.price-new", "span.current-price", "div.price strong", "span[data-testid='price']"):
                price = _price_from_text(card.select_one(sel))
                if price is not None:
                    break

        # --- 3) fallback do strony produktu ---
        if price is None:
            price = _fetch_price_from_product(link)

        items.append(ProductOffer(title, price, "PLN", "Morele", link, img))
    return items

# rejestr
SCRAPERS: Dict[str, Callable[[str], List[ProductOffer]]] = {
    "mediaexpert": scrape_media_expert,
    "xkom": scrape_xkom,
    "morele": scrape_morele,
}
