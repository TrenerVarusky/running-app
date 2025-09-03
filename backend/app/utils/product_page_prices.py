from typing import Optional, Dict, List
from urllib.parse import urlparse, urlsplit, urlunsplit, parse_qsl, urlencode
from concurrent.futures import ThreadPoolExecutor, as_completed
from requests.adapters import HTTPAdapter, Retry
from datetime import datetime
import requests
import json
from bs4 import BeautifulSoup

from app.schemas.price import Offer  # Pydantic BaseModel!

# --------- HTTP ----------

HDRS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
    # ważne: unikamy brotli, żeby requests nie potrzebował brotli-cffi
    "Accept-Encoding": "gzip, deflate",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": "https://www.google.com/",
}

DEBUG = True

def _clean_url(u: str) -> str:
    p = urlsplit(u)
    q = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True)
         if k.lower() not in {"gclid","gbraid","gad_source","utm_source","utm_medium",
                              "utm_campaign","utm_term","utm_content"}]
    return urlunsplit((p.scheme, p.netloc, p.path, urlencode(q), p.fragment))

def _session_with_retries() -> requests.Session:
    s = requests.Session()
    retry = Retry(
        total=3, connect=3, read=3,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET","HEAD"})
    )
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.mount("http://",  HTTPAdapter(max_retries=retry))
    s.headers.update(HDRS)
    return s

def _get(url: str):
    """Zwraca (html_text:str|None, final_url:str|None). Robi snapshot gdy html krótki."""
    url = _clean_url(url)
    s = _session_with_retries()
    try:
        r = s.get(url, timeout=12, allow_redirects=True)
        final_url = r.url
        text = r.text or ""

        # gdy .text puste, spróbuj ręcznie zdekodować bytes
        if not text and r.content:
            try:
                # fallback: spróbuj wykryć enkodę
                import chardet
                enc = chardet.detect(r.content).get("encoding") or "utf-8"
                text = r.content.decode(enc, errors="ignore")
            except Exception:
                text = r.content.decode("utf-8", errors="ignore")

        # snapshot, jeśli coś jest nie tak
        if r.status_code != 200 or len(text) < 200:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            snap = f"debug_{ts}.html"
            with open(snap, "w", encoding="utf-8") as f:
                f.write(text or "")
            print(f"[DEBUG] {r.status_code} {final_url} | html_len={len(text)} | snapshot={snap}")

        if r.status_code == 200 and text:
            return text, final_url
    except Exception as e:
        print(f"[GET][ERR] {url} -> {e}")

    return None, None

# --------- price parsing ----------
def _norm_price(txt: str) -> Optional[float]:
    if not txt:
        return None
    t = txt.replace("\xa0", " ").replace("zł", "").replace("PLN", "").strip()
    t = t.replace(" ", "").replace(",", ".")
    num, dot = "", False
    for ch in t:
        if ch.isdigit():
            num += ch
        elif ch == "." and not dot:
            num += "."
            dot = True
    try:
        return float(num) if num else None
    except Exception:
        return None

# --------- domain handlers ----------
def _price_morele(s: BeautifulSoup) -> Optional[float]:
    el = s.select_one("#product_price")
    if el and el.get("data-price"):
        return _norm_price(el.get("data-price"))
    for sel in ['meta[itemprop="price"]', 'span[itemprop="price"]', "span.price", "div.price span"]:
        e = s.select_one(sel)
        if e:
            p = _norm_price(e.get("content") or e.get_text(" ", strip=True))
            if p is not None:
                return p
    return None

def _price_mediaexpert(s: BeautifulSoup) -> Optional[float]:
    # rozbite na whole + rest
    whole = s.select_one("span.whole")
    rest = s.select_one("span.rest")
    if whole:
        txt = whole.get_text(strip=True)
        if rest:
            txt += "," + rest.get_text(strip=True)
        return _norm_price(txt)

    # fallback na inne selektory
    el = s.select_one("div.prices span, span.price, span.actual-price")
    if el:
        return _norm_price(el.get_text(" ", strip=True))

    return None

def _price_xkom(s: BeautifulSoup) -> Optional[float]:
    # 1) aria-label w kontenerze ceny (najpewniejsze)
    el = s.select_one('div[data-name="productPrice"] [aria-label*="Cena"]')
    if DEBUG:
        print("[ME] aria node:", bool(el), "| aria:", (el.get("aria-label") if el else None))
    if el:
        val = el.get("aria-label") or el.get_text(" ", strip=True)
        p = _norm_price(val)
        if p is not None:
            if DEBUG: print("[ME] price from aria:", p)
            return p

    # 2) starszy layout: whole + rest
    whole = s.select_one("span.whole")
    rest = s.select_one("span.rest")
    if DEBUG:
        print("[ME] whole:", whole.get_text(strip=True) if whole else None,
              "| rest:", rest.get_text(strip=True) if rest else None)
    if whole:
        txt = whole.get_text(strip=True)
        if rest:
            txt += "," + rest.get_text(strip=True)
        p = _norm_price(txt)
        if p is not None:
            if DEBUG: print("[ME] price from whole/rest:", p)
            return p

    # 3) proste fallbacki
    for sel in ("div.prices span", "span.price", "span.actual-price"):
        el2 = s.select_one(sel)
        if DEBUG:
            print(f"[ME] try sel '{sel}':", el2.get_text(" ", strip=True) if el2 else None)
        if el2:
            p = _norm_price(el2.get_text(" ", strip=True))
            if p is not None:
                if DEBUG: print("[ME] price from fallback:", p)
                return p

    # 4) ultimate fallback: poszukaj najbliższego „zł”
    txt = s.get_text(" ", strip=True)
    near = None
    if "zł" in txt:
        near = txt.split("zł", 1)[0].split()[-1] + " zł" if txt.split("zł", 1)[0].split() else None
    if DEBUG:
        print("[ME] near 'zł':", near)
    return None

DOMAIN_PRICE = {
    "morele.net": _price_morele,
    "mediaexpert.pl": _price_mediaexpert,
    "x-kom.pl": _price_xkom,
}

# --------- single offer fetch ----------
def _fetch_offer(merchant: str, url: str) -> Offer:
    price = None
    image = None
    html = _get(url)
    if html:
        if DEBUG:
            print(f"[{merchant}] HTML length:", len(html))
        s = BeautifulSoup(html, "html.parser")
        host = (urlparse(url).hostname or "").lower()
        handler = next((fn for dom, fn in DOMAIN_PRICE.items() if host.endswith(dom)), None)
        if DEBUG:
            print(f"[{merchant}] handler:", handler.__name__ if handler else None, "| host:", host)
        if handler:
            price = handler(s)
        ogimg = s.select_one('meta[property="og:image"]')
        if ogimg and ogimg.get("content"):
            image = ogimg.get("content")
    else:
        if DEBUG:
            print(f"[{merchant}] Brak HTML (None).")
    return Offer(title=merchant, price=price, currency="PLN", merchant=merchant, url=url, image=image)

# --------- public APIs for router ----------
def fetch_model_offers(links: Dict[str, str]) -> List[Offer]:
    """Równoległe pobranie ofert dla danego modelu (max 3 wątki)."""
    offers: List[Offer] = []
    if not links:
        return offers
    workers = max(1, min(3, len(links)))
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(_fetch_offer, m, u): m for m, u in links.items()}
        for f in as_completed(futs):
            try:
                offers.append(f.result())
            except Exception as e:
                print(f"[WARN] {futs[f]} failed: {e}")
    offers.sort(key=lambda o: (o.price is None, o.price or 0.0))
    return offers

def fetch_model_offers_seq(links: Dict[str, str]) -> List[Offer]:
    """Wersja sekwencyjna (najprostsza i bardzo stabilna)."""
    offers: List[Offer] = []
    for merchant, url in links.items():
        try:
            offers.append(_fetch_offer(merchant, url))
        except Exception as e:
            print(f"[WARN] {merchant} failed: {e}")
    offers.sort(key=lambda o: (o.price is None, o.price or 0.0))
    return offers