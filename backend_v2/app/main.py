from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend_v2.app.core.database import Base, engine, ensure_database_exists
from backend_v2.app.core.migrations import run_migrations
from backend_v2.app.routes import users, env_check, auth, me_profile, training_profile, posts, admin_posts
from backend_v2.app.core.exceptions import register_exception_handlers
from fastapi.middleware.cors import CORSMiddleware

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

origins = [
    "http://localhost:3000",  # CRA
    "http://localhost:5173",  # Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(env_check.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(me_profile.router)
app.include_router(training_profile.router)
app.include_router(posts.router)
app.include_router(admin_posts.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}", tags=["greetings"])
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
