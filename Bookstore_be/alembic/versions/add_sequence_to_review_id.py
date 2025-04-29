"""add sequence to review id

Revision ID: add_sequence_to_review_id
Revises: add_sequence_to_order_item
Create Date: 2025-04-28 11:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_sequence_to_review_id'
down_revision: Union[str, None] = 'add_sequence_to_order_item'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create sequence for review.id
    op.execute("CREATE SEQUENCE IF NOT EXISTS review_id_seq")
    op.execute("ALTER TABLE review ALTER COLUMN id SET DEFAULT nextval('review_id_seq')")
    op.execute("SELECT setval('review_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM review))")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove sequence
    op.execute("ALTER TABLE review ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS review_id_seq")