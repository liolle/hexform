from datetime import datetime
from sqlalchemy import String 
from sqlalchemy import CheckConstraint, String, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import dbBase

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import Surveys, Users, Answers, SurveyKeys


class Submissions(dbBase):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE",onupdate="CASCADE"), nullable=False)
    survey_id: Mapped[str] = mapped_column(String(48),ForeignKey("surveys.id",ondelete="CASCADE",onupdate="CASCADE"), nullable=False)
    key_id: Mapped[str] = mapped_column(String(48), ForeignKey("survey_keys.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())
    
    # Relationships
    user: Mapped["Users"] = relationship(
        "Users", 
        foreign_keys=[user_id],
        back_populates="submissions",
        uselist=False
    )

    survey: Mapped["Surveys"] = relationship(
        "Surveys", 
        foreign_keys=[survey_id],
        back_populates="submissions",
        uselist=False
    )

    key: Mapped["SurveyKeys"] = relationship(
        "SurveyKeys",
        foreign_keys=[key_id],
        back_populates="submission",
        uselist=False
    )

    answers: Mapped[list["Answers"]] = relationship(
        "Answers",
        foreign_keys="Answers.submission_id",
        back_populates="submission",
    )


    __table_args__ = (
        UniqueConstraint("user_id", "survey_id", name="uk_submissions"),
    )

    def __repr__(self) -> str:
        return f"{self.id} : {self.user_id} : {self.survey_id} : {self.key_id}"



