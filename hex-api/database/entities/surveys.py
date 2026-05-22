from datetime import datetime
from sqlalchemy import String 
from sqlalchemy import CheckConstraint, String, Enum as EnumSQL, ForeignKey,UniqueConstraint 
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import dbBase
from enum import Enum

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import Questions, Users

class SurveyState(Enum):
    CREATED = 'CREATED'
    PUBLISHED = 'PUBLISHED'
    DONE = 'DONE'


class Surveys(dbBase):
    __tablename__ = "surveys"

    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(1000))
    state: Mapped[SurveyState] = mapped_column(EnumSQL(SurveyState, name='type'), nullable=False,default=SurveyState.CREATED)

    owner_id: Mapped[str] = mapped_column(String(32),
                                          ForeignKey("users.id",ondelete="CASCADE",onupdate="CASCADE"),
                                          nullable=False)
    is_public: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())

    # relationship

    # questions 
    questions : Mapped[list["Questions"]] = relationship(
        "Questions",
        back_populates="survey",
        foreign_keys="Questions.survey_id"
    )

    # owner
    owner : Mapped["Users"] = relationship(
        "Users",
        back_populates="crated_surveys",
        foreign_keys=[owner_id],
        uselist=False
    ) 

    __table_args__ = (

    )





