"""Add google_id column to user table

Revision ID: aec8b6dcc72c
Revises: 7834c0415a51
Create Date: 2025-04-15 18:50:23.388632

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aec8b6dcc72c'
down_revision: Union[str, None] = '7834c0415a51'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user', sa.Column('google_id', sa.String(length=255), nullable=True))
    op.create_unique_constraint('uq_google_id', 'user', ['google_id'])  # Ensure google_id is 
    pass


def downgrade() -> None:
    op.drop_constraint('uq_google_id', 'user', type_='unique')
    op.drop_column('user', 'google_id')
    pass
