from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CreateSurveyForm(BaseModel):
    title :str
    description :str
    is_public :bool

class SurveyQuestionForm(BaseModel):
    id:str 
    title:str
    type:str
    config:str 
    last_modified:datetime 
    position:int

class UpdateSurveyQuestionForm(BaseModel):
    questions : list[SurveyQuestionForm] 

class SurveyAnswerForm(BaseModel):
    id:str
    response:str
    type:str

class SubmitSurveyForm(BaseModel):
    responses:list[SurveyAnswerForm] 


class SurveyData():
    _id:str
    _title:str
    _description:str
    _is_public:bool

    @property
    def id(self):
        return self._id

    @property
    def titel(self):
        return self._title

    @property
    def description(self):
        return self._description

    @property
    def is_public(self):
        return self._is_public


    def __init__(self, id:str, title:str, description:str, is_public:bool) -> None:
        self._id = id
        self._title = title
        self._description = description
        self._is_public = is_public


