"""empty message

Revision ID: 71c452b5d891
Revises: 0b1fa3893668
Create Date: 2025-03-29 02:14:11.821818

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '71c452b5d891'
down_revision = '0b1fa3893668'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('avatar',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('avatar_url', sa.String(length=255), nullable=False),
    sa.Column('filename', sa.String(length=100), nullable=True),
    sa.Column('status', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('customization',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('avatar_id', sa.Integer(), nullable=False),
    sa.Column('skin_color', sa.String(length=50), nullable=True),
    sa.Column('outfit_color', sa.String(length=50), nullable=True),
    sa.Column('accessories', sa.Text(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['avatar_id'], ['avatar.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('username', sa.String(length=80), nullable=False))
        batch_op.add_column(sa.Column('password_hash', sa.String(length=128), nullable=False))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.create_unique_constraint(None, ['username'])
        batch_op.drop_column('is_active')
        batch_op.drop_column('password')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password', sa.VARCHAR(length=80), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='unique')
        batch_op.drop_column('created_at')
        batch_op.drop_column('password_hash')
        batch_op.drop_column('username')

    op.drop_table('customization')
    op.drop_table('avatar')
    # ### end Alembic commands ###
