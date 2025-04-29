"""Add user_id column to review table

Revision ID: add_user_id_to_review
Revises: aec8b6dcc72c
Create Date: 2025-04-15 19:30:45.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_user_id_to_review'
down_revision: Union[str, None] = 'aec8b6dcc72c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add user_id column to review table
    op.add_column('review', sa.Column('user_id', sa.BIGINT(), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_review_user_id', 
        'review', 'user', 
        ['user_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint('fk_review_user_id', 'review', type_='foreignkey')
    
    # Drop user_id column
    op.drop_column('review', 'user_id')