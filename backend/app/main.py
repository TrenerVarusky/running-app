from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import hello

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # możesz potem podać konkretny frontend (np. http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello.router)