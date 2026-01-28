from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend_v2.app.core.database import Base, engine, ensure_database_exists
from backend_v2.app.core.migrations import run_migrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_database_exists()
        run_migrations()
        yield
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise

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
