from dataclasses import dataclass
from typing import List, Dict, Optional, Callable
import requests, time, re
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
}
TIMEOUT = 15
RATE_LIMIT_S = 1.2
_LAST: Dict[str, float] = {}
PRICE_RE = re.compile(r"([0-9]+[\s\u00A0]?[0-9]*[\,\.]?[0-9]{0,2})")

def _rate(host: str) -> None:
    now = time.time()
    last = _LAST.get(host, 0.0)
    if now - last < RATE_LIMIT_S:
        time.sleep(RATE_LIMIT_S - (now - last))
    _LAST[host] = time.time()

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

def _soup(url: str) -> BeautifulSoup:
    host = url.split("/")[2]
    _rate(host)
    r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

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

def scrape_media_expert(q: str) -> List[ProductOffer]:
    url = "https://www.mediaexpert.pl/search?query=" + requests.utils.quote(q)
    soup = _soup(url)
    items: List[ProductOffer] = []
    for card in soup.select("div.offer-box") or soup.select("div.listing-item"):
        title_el = card.select_one("a.is-choose-product, a.name, a.product-name")
        price_el = card.select_one("span.whole, span.price")
        img_el = card.select_one("img")
        if not title_el:
            continue
        title = title_el.get("title") or title_el.get_text(strip=True)
        link = title_el.get("href")
        if link and link.startswith("/"):
            link = "https://www.mediaexpert.pl" + link
        price = _price(price_el.get_text(" ", strip=True) if price_el else "")
        img = (img_el.get("data-src") or img_el.get("src")) if img_el else None
        items.append(ProductOffer(title, price, "PLN", "Media Expert", link, img))
    return items

def scrape_xkom(q: str) -> List[ProductOffer]:
    url = "https://www.x-kom.pl/szukaj?q=" + requests.utils.quote(q)
    soup = _soup(url)
    items: List[ProductOffer] = []
    for card in soup.select("div.sc-1yu46qn-6") or soup.select("div.product-item"):
        title_el = card.select_one("a.sc-1h16fat-0") or card.select_one("a")
        price_el = card.select_one("span.sc-6n68ef-0") or card.find(attrs={"data-name": "price"})
        img_el = card.select_one("img")
        if not title_el:
            continue
        title = title_el.get_text(strip=True)
        link = title_el.get("href")
        if link and link.startswith("/"):
            link = "https://www.x-kom.pl" + link
        price = _price(price_el.get_text(" ", strip=True) if price_el else "")
        img = img_el.get("src") if img_el else None
        items.append(ProductOffer(title, price, "PLN", "x-kom", link, img))
    return items

def scrape_morele(q: str) -> List[ProductOffer]:
    url = "https://www.morele.net/wyszukiwarka/?q=" + requests.utils.quote(q)
    soup = _soup(url)
    items: List[ProductOffer] = []
    for card in soup.select("div.cat-list-products div.product") or soup.select("div.listing-product"):
        title_el = card.select_one("a.productLink") or card.select_one("a.prod-name")
        price_el = card.select_one("span.price-new") or card.select_one("div.price")
        img_el = card.select_one("img")
        if not title_el:
            continue
        title = title_el.get("title") or title_el.get_text(strip=True)
        link = title_el.get("href")
        if link and link.startswith("/"):
            link = "https://www.morele.net" + link
        price = _price(price_el.get_text(" ", strip=True) if price_el else "")
        img = (img_el.get("data-src") or img_el.get("src")) if img_el else None
        items.append(ProductOffer(title, price, "PLN", "Morele", link, img))
    return items

SCRAPERS: Dict[str, Callable[[str], List[ProductOffer]]] = {
    "mediaexpert": scrape_media_expert,
    "xkom": scrape_xkom,
    "morele": scrape_morele,
}
