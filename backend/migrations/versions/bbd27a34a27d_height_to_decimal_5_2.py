"""height to decimal(5,2)

Revision ID: bbd27a34a27d
Revises: 9bdfdfd2e431
Create Date: 2025-08-18 12:23:11.323942

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bbd27a34a27d'
down_revision: Union[str, Sequence[str], None] = '9bdfdfd2e431'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'user_profiles',
        'height_cm',
        existing_type=sa.Integer(),
        type_=sa.Numeric(5, 2),
        existing_nullable=True
    )

def downgrade() -> None:
    op.alter_column(
        'user_profiles',
        'height_cm',
        existing_type=sa.Numeric(5, 2),
        type_=sa.Integer(),
        existing_nullable=True
    )