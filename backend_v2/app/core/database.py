# app/core/database.py
import os
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_PORT = os.getenv("DB_PORT", "5333")
DB_NAME = os.getenv("DB_NAME", "running_db")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "P@ssw0rd321")

Base = declarative_base()


def build_odbc_string(database_name=None):
    db = database_name if database_name else ""
    return (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={DB_SERVER},{DB_PORT};"
        f"DATABASE={db};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )


def get_engine(database_name=None):
    params = urllib.parse.quote_plus(build_odbc_string(database_name))
    return create_engine(
        f"mssql+pyodbc:///?odbc_connect={params}",
        echo=False,
        pool_pre_ping=True,
    )


def ensure_database_exists():
    master_engine = get_engine("master")

    with master_engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        result = conn.execute(
            text("SELECT name FROM sys.databases WHERE name = :name"),
            {"name": DB_NAME}
        ).fetchone()

        if not result:
            print(f"[INFO] Database '{DB_NAME}' does not exist. Creating...")
            conn.execute(text(f"CREATE DATABASE [{DB_NAME}]"))
        else:
            print(f"[INFO] Database '{DB_NAME}' already exists.")


engine = get_engine(DB_NAME)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
