"""add sequence to order_item

Revision ID: add_sequence_to_order_item
Revises: b5477b9ae3b4
Create Date: 2023-10-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_sequence_to_order_item'
down_revision = 'b5477b9ae3b4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create sequence for order_item.id
    op.execute("CREATE SEQUENCE IF NOT EXISTS order_item_id_seq")
    op.execute("ALTER TABLE order_item ALTER COLUMN id SET DEFAULT nextval('order_item_id_seq')")
    op.execute("SELECT setval('order_item_id_seq', (SELECT MAX(id) FROM order_item))")


def downgrade() -> None:
    # Remove sequence
    op.execute("ALTER TABLE order_item ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS order_item_id_seq")