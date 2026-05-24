"""update survey state enum

Revision ID: 2b12cfbae8e8
Revises: f4e95b56f9da
Create Date: 2026-05-23 13:38:49.787289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2b12cfbae8e8'
down_revision: Union[str, Sequence[str], None] = 'f4e95b56f9da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('surveys', 'state')
    op.execute("CREATE TYPE state AS ENUM ('CREATED', 'PUBLISHED', 'DONE')")
    op.add_column('surveys', sa.Column('state', 
                                       sa.Enum('CREATED', 'PUBLISHED', 'DONE', name='state'),
                                       nullable=False,
                                       server_default='CREATED'))
   


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('surveys', 'state')
    op.execute("DROP TYPE state")
