"""add user_profiles table

Revision ID: 9bdfdfd2e431
Revises: 
Create Date: 2025-08-18 11:16:48.653312

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9bdfdfd2e431'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_profiles',
        sa.Column('user_id', sa.Integer(), nullable=False),  # <-- INT zamiast String(64)
        sa.Column('first_name', sa.String(length=80), nullable=True),
        sa.Column('last_name', sa.String(length=80), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('height_cm', sa.Integer(), nullable=True),
        sa.Column('weight_kg', sa.Numeric(5, 2), nullable=True),  # DECIMAL/Numeric ok
        sa.Column('gender', sa.String(length=10), nullable=True),
        sa.Column('preferred_units', sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('user_id'),
    )
    op.create_index(op.f('ix_user_profiles_user_id'), 'user_profiles', ['user_id'], unique=False)

    # (opcjonalnie USUŃ jeśli nie chcesz zmieniać typu kolumny users.role)
    # op.alter_column('users', 'role', existing_type=..., type_=sa.String(), ...)

def downgrade() -> None:
    # (jeśli usuniesz alter powyżej, usuń też poniższy)
    # op.alter_column('users', 'role', existing_type=sa.String(), type_=sa.VARCHAR(length=50), ...)

    op.drop_index(op.f('ix_user_profiles_user_id'), table_name='user_profiles')
    op.drop_table('user_profiles')
