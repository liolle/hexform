from datetime import datetime
from sqlalchemy import PrimaryKeyConstraint, String, values 
from sqlalchemy import CheckConstraint, String, Enum as EnumSQL, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import dbBase
from enum import Enum

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import Surveys, Submissions


class SurveyKeys(dbBase):
    __tablename__ = "survey_keys"

    id:Mapped[str] = mapped_column(String(48), primary_key=True)
    survey_id: Mapped[str] = mapped_column(String(48), ForeignKey("surveys.id",ondelete="CASCADE",onupdate="CASCADE"), nullable= False)
    value: Mapped[str] = mapped_column(String(100) ,nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())

    survey: Mapped["Surveys"] = relationship(
        "Surveys",
        foreign_keys=[survey_id],
        back_populates="keys",
        uselist=False
    )

    submission: Mapped["Submissions"] = relationship(
        "Submissions",
        foreign_keys="Submissions.key_id",
        back_populates="key",
    )

    __table_args__ = (
        UniqueConstraint("value", name="uk_survey_key_value"),
    )

