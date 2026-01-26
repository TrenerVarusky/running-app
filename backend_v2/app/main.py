from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend_v2.app.core.database import Base, engine, ensure_database_exists

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="API",
    description="API do testów z FastAPI i Swagger UI",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}", tags=["greetings"])
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
