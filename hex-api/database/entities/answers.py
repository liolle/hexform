from datetime import datetime
from sqlalchemy import JSON, PrimaryKeyConstraint, String, values 
from sqlalchemy import CheckConstraint, String, Enum as EnumSQL, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import dbBase
from enum import Enum

from typing import TYPE_CHECKING, Dict, Any

if TYPE_CHECKING:
    from database import Submissions, Questions


class Answers(dbBase):
    __tablename__ = "answers"
    
    id: Mapped[str] = mapped_column(String(56), primary_key=True)
    
    submission_id: Mapped[str] = mapped_column(String(48), ForeignKey("submissions.id",ondelete="CASCADE",onupdate="CASCADE"), nullable=False)
    question_id: Mapped[str] = mapped_column(String(56), ForeignKey("questions.id",ondelete="CASCADE",onupdate="CASCADE"), nullable=False)
    
    answer_text: Mapped[str] = mapped_column(String(5000), nullable=True)
    answer_number: Mapped[float] = mapped_column(nullable=True)
    answer_bool: Mapped[bool] = mapped_column(nullable=True)
    answer_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=True)
    
    # Relationships
    

    submission: Mapped["Submissions"] = relationship(
        "Submissions", 
        foreign_keys=[submission_id],
        back_populates="answers")

    question: Mapped["Questions"] = relationship(
        "Questions", 
        foreign_keys=[question_id],
        back_populates="answers",
        uselist=False
    )

    __table_args__ = (
        UniqueConstraint("submission_id", "question_id", name="uk_answers"),
        CheckConstraint(
            "answer_text IS NOT NULL OR answer_number IS NOT NULL OR answer_bool IS NOT NULL OR answer_json IS NOT NULL",
            name="ck_answer_at_least_one"
        ),
    )

