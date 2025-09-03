from contextlib import contextmanager
import os
from typing import Iterable
from seleniumbase import SB

HEADLESS = os.getenv("SB_HEADLESS", "1") not in ("0", "false", "False")

@contextmanager
def browser():
    # block_images=True ogranicza ładowanie multimediów
    with SB(
        uc=True,
        headless=HEADLESS,
        browser="chrome",
        locale_code="pl",
        block_images=True,                 # <<< ważne
        do_not_track=True,
    ) as sb:
        yield sb

def get_html(
    url: str,
    wait_css: str,
    accept_texts: Iterable[str] = ("Akceptuję", "Zgadzam się", "Accept", "Accept all"),
    timeout_ms: int = 8000,               # <<< krótszy timeout
) -> str:
    with browser() as sb:
        sb.open(url)
        sb.wait_for_element_visible(wait_css, timeout=timeout_ms)
        for txt in accept_texts:
            try:
                sb.click_if_present(f"button:contains('{txt}')", timeout=1000)
                break
            except Exception:
                pass
        for txt in accept_texts:
            try:
                sb.click_if_present(f"a:contains('{txt}')", timeout=1000)
                break
            except Exception:
                pass
        return sb.get_page_source()
