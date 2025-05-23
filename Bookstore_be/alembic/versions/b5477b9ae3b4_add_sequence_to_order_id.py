"""add sequence to order id

Revision ID: b5477b9ae3b4
Revises: aec8b6dcc72c
Create Date: 2025-04-27 17:59:31.844380

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5477b9ae3b4'
down_revision: Union[str, None] = 'aec8b6dcc72c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('book', 'book_summary',
               existing_type=sa.TEXT(),
               nullable=True)
    op.alter_column('book', 'book_cover_photo',
               existing_type=sa.VARCHAR(length=200),
               nullable=True)
    op.add_column('review', sa.Column('rating_star', sa.String(length=255), nullable=True))
    op.drop_column('review', 'rating_star')
    op.drop_constraint('uq_google_id', 'user', type_='unique')
    op.drop_column('user', 'google_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('google_id', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
    op.create_unique_constraint('uq_google_id', 'user', ['google_id'])
    op.add_column('review', sa.Column('rating_star', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
    op.drop_column('review', 'rating_star')
    op.alter_column('book', 'book_cover_photo',
               existing_type=sa.VARCHAR(length=200),
               nullable=False)
    op.alter_column('book', 'book_summary',
               existing_type=sa.TEXT(),
               nullable=False)
    # ### end Alembic commands ###
