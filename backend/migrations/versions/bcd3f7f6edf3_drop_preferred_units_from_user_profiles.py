"""drop preferred_units from user_profiles

Revision ID: bcd3f7f6edf3
Revises: bbd27a34a27d
Create Date: 2025-08-19 08:13:53.440818

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bcd3f7f6edf3'
down_revision: Union[str, Sequence[str], None] = 'bbd27a34a27d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("user_profiles", "preferred_units")

def downgrade() -> None:
    op.add_column(
        "user_profiles",
        sa.Column("preferred_units", sa.String(length=10), nullable=True)
    )
