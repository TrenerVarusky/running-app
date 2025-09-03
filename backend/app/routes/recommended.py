from fastapi import APIRouter
from app.schemas.price import Offer, SearchResponse
from app.utils.product_page_prices import fetch_model_offers

router = APIRouter(prefix="/prices/recommended", tags=["recommended"])

GARMIN_55_LINKS = {
    "Media Expert": "https://www.mediaexpert.pl/smartfony-i-zegarki/smartwatche-i-zegarki/smartwatche/zegarek-garmin-forerunner-55-czarny",
    "Morele":       "https://www.morele.net/zegarek-sportowy-garmin-forerunner-55-czarny-010-02562-10-8536376/",
    "x-kom":        "https://www.x-kom.pl/p/658938-zegarek-sportowy-garmin-forerunner-55-42mm-czarny.html"
}

GARMIN_255_LINKS = {
    "Media Expert": "https://www.mediaexpert.pl/smartfony-i-zegarki/smartwatche-i-zegarki/smartwatche/zegarek-sportowy-garmin-forerunner-255-niebieski?gad_source=1&gad_campaignid=22657663391&gbraid=0AAAAADoIO69uqCLCymydA5DZVfYeTOBUU&gclid=CjwKCAjwiNXFBhBKEiwAPSaPCcieMoqrDMvzAV431DB9wAnqScqqQP9UX_6--hp3U-RblrModrxaLhoCN34QAvD_BwE",
    "Morele":       "https://www.morele.net/zegarek-sportowy-garmin-forerunner-255-szary-010-02641-10-11084200/",
    "x-kom":        "https://www.x-kom.pl/p/1145892-zegarek-sportowy-garmin-forerunner-255-46mm-tidal-blue.html"  # podmień na konkretny produkt, gdy masz
}


@router.get("/garmin55", response_model=SearchResponse)
def garmin_55():
    model = "Garmin Forerunner 55"
    offers = fetch_model_offers(GARMIN_55_LINKS) 
    return SearchResponse(query=model, offers=offers)

@router.get("/garmin255", response_model=SearchResponse)
def garmin_255():
    model = "Garmin Forerunner 255"
    offers = fetch_model_offers(GARMIN_255_LINKS) 
    return SearchResponse(query=model, offers=offers)

