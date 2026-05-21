from sqlalchemy import String 
from sqlalchemy import CheckConstraint, String, Enum, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import dbBase

'''
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import *
'''

class Users(dbBase):

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=True)

    # Credentials
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    password: Mapped[str] = mapped_column(String(100), nullable=False)

    __table_args__ = (
        UniqueConstraint("nickname", name="uk_users_nickname"),
        UniqueConstraint("username", name="uk_users_username"),
    )

    def __repr__(self) -> str:
        return f"{self.id} : {self.nickname} : {self.email} : {self.password}"
