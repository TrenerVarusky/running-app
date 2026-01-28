from logging.config import fileConfig
import importlib
import pkgutil
import urllib.parse

from alembic import context
from sqlalchemy import create_engine, pool

from app.core.database import Base, build_odbc_string, DB_NAME, ensure_database_exists
import app.models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

for m in pkgutil.iter_modules(app.models.__path__):
    importlib.import_module(f"app.models.{m.name}")

target_metadata = Base.metadata

def get_url() -> str:
    ensure_database_exists()
    odbc = build_odbc_string(DB_NAME)
    params = urllib.parse.quote_plus(odbc)
    return f"mssql+pyodbc:///?odbc_connect={params}"

def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = create_engine(get_url(), poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
