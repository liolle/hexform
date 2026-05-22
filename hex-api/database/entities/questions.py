
from datetime import datetime
from sqlalchemy import CheckConstraint, String, Enum as EnumSQL, JSON, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import dbBase
from enum import Enum
from typing import Any, Dict

'''
text
number
rating
bool
multi_pick
'''


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import Surveys, Answers

class QType(Enum):
    TEXT = 'TEXT'
    NUMBER = 'NUMBER'
    RATING = 'RATING'
    BOOL = 'BOOL'
    MULTI_PICK = 'MULTI_PICK'

class Questions(dbBase):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(56), primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[QType] = mapped_column(EnumSQL(QType, name='type'), nullable=False)

    survey_id: Mapped[str] = mapped_column(String(48),ForeignKey("surveys.id",ondelete="CASCADE",onupdate="CASCADE"), nullable=False)
    last_modified: Mapped[datetime] = mapped_column(default=datetime.now())

    config: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    position : Mapped[int] = mapped_column()

    # relationship
    survey: Mapped["Surveys"] = relationship(
        "Surveys",
        foreign_keys=[survey_id],
        back_populates="questions",
        uselist=False
    )

    answers: Mapped[list["Answers"]] = relationship(
        "Answers",
        foreign_keys="Answers.question_id",
        back_populates="question"
    )

    __table_args__ = (
        CheckConstraint('position >= 0', name="ck_questions_position"),
    )
