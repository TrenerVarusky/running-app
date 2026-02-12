from alembic import command
from alembic.config import Config
from pathlib import Path
import os
import sys


def run_migrations():
    base_dir = Path(__file__).resolve().parents[2]
    alembic_ini_path = base_dir / "alembic.ini"
    migrations_dir = base_dir / "migrations"

    if not alembic_ini_path.exists():
        raise RuntimeError(f"alembic.ini not found: {alembic_ini_path}")

    if not migrations_dir.exists():
        raise RuntimeError(f"migrations folder not found: {migrations_dir}")

    os.chdir(str(base_dir))
    if str(base_dir) not in sys.path:
        sys.path.insert(0, str(base_dir))

    alembic_cfg = Config(str(alembic_ini_path))

    alembic_cfg.set_main_option("script_location", str(migrations_dir))

    command.upgrade(alembic_cfg, "head")
