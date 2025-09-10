from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import hello, env_check, auth, users, me_profile, training_profile, posts, admin_posts
from app.models import post 
from db.connection import engine, Base

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # możesz potem podać konkretny frontend (np. http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello.router)
app.include_router(env_check.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(me_profile.router)
app.include_router(training_profile.router)
app.include_router(posts.router)
app.include_router(admin_posts.router)

Base.metadata.create_all(bind=engine)