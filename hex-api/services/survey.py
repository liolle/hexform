from datetime import datetime
from operator import and_
from sqlalchemy import delete, func, insert, select, exists, and_
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql.functions import count
from dto import SurveyData, CreateSurveyForm, SurveyQuestionForm, SubmitSurveyForm
from database import Surveys, SurveyState,Submissions, Questions, Answers, QType, dbConnection
from utils import generate_id, Result
from services import verify_token
from fastapi import status

class SurveyService():


    def create_survey(self,form:CreateSurveyForm, access_token)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        owner_id = token_res.keys["claims"]["id"]
        id = generate_id(48,"SV")
        survey = Surveys(id=id,owner_id=owner_id,title=form.title,description=form.description, is_public=form.is_public)

        with dbConnection() as con:
            try:
                con.add(survey)
                con.commit()
                con.refresh(survey)
                return Result(True,{"survey": survey}) 
            except Exception as e:
                print(e)
                return Result(False, {
                    "reason":"survey creation failed" 
                })

    def delete_survey(self, id:str, access_token:str):
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]

        stm = select(Surveys).where(Surveys.id == id )

        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar_one_or_none()
                if survey == None:
                    return Result(False,{"reason":"Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.owner_id != user_id :
                    return Result(False,{"reason":"Could not delete the survey", "status_code" : status.HTTP_403_FORBIDDEN })

                con.delete(survey)
                con.commit()
            except Exception :
                pass

        return Result(True)


    def get_survey_questions(self,survey_id:str,access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})


        stm = select(Questions).where(Questions.survey_id == survey_id )

        with dbConnection() as con:
            try:
                questions = con.execute(stm).scalars().all()
                return Result(True,{"questions": questions}) 
            except Exception :
                return Result(False,{"reason":"Could not get the survey questions"})



    def update_survey_questions(self,questions: list[SurveyQuestionForm],survey_id:str,access_token:str)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]

        stm = select(Surveys).where(Surveys.id == survey_id )

        data:list = []

        for q in questions:
            if not q.id:
                id = generate_id(48,"SVQ")
                q.id = id
            data.append(
                {
                    "id": q.id,
                    "title": q.title,
                    "type": QType(q.type),
                    "survey_id": survey_id,
                    "last_modified": datetime.now(),
                    "config": q.config or {},  # Handle empty config
                    "position": q.position
                }
            )


        incoming_ids = [q.id for q in questions]

        delStm = delete(Questions).where(
            and_(
                Questions.survey_id == survey_id,
                Questions.id.not_in(incoming_ids)
            )
        )

        insertStm = insert(Questions).values(data)
        insertStm = insertStm.on_conflict_do_update(
            index_elements=['id'],
            set_={
                'title': insertStm.excluded.title,
                'type': insertStm.excluded.type,
                'last_modified': insertStm.excluded.last_modified,
                'config': insertStm.excluded.config,
                'position': insertStm.excluded.position
            }
        )


        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar_one_or_none()
                if survey == None:
                    return Result(False,{"reason":"Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.owner_id != user_id :
                    return Result(False,{"reason":"Could not delete the survey", "status_code" : status.HTTP_403_FORBIDDEN })

                con.execute(delStm)

                if len(data)>0 :
                    con.execute(insertStm)

                con.commit()

                return Result(True,{"questions": questions}) 
            except Exception as e:
                print(e)
                return Result(False,{"reason":"Could not update the survey", "status_code" : status.HTTP_400_BAD_REQUEST })

    def update_survey(self,form:CreateSurveyForm,survey_id:str,access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]

        stm = select(Surveys).where(Surveys.id == survey_id )


        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar_one_or_none()
                if survey == None:
                    return Result(False,{"reason":"Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.owner_id != user_id :
                    return Result(False,{"reason":"Could not delete the survey", "status_code" : status.HTTP_403_FORBIDDEN })

                survey.description = form.description
                survey.is_public = form.is_public
                survey.title = form.title

                con.commit()
                con.refresh(survey)

                return Result(True,{"survey": survey}) 
            except Exception as e:
                print(e)
                return Result(False,{"reason":"Could not update the survey", "status_code" : status.HTTP_400_BAD_REQUEST })


    def get_surveys_created_by(self, access_token:str,include_q = False)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]


        stm = select(
                    Surveys,
                    exists().where(
                        and_(
                            Submissions.survey_id == Surveys.id,
                            Submissions.user_id == user_id  
                        )
                    ).label("submited")
                ).where(Surveys.owner_id == user_id)



        if (include_q):
            stm = stm.options(
                selectinload(Surveys.questions)
            )


        with dbConnection() as con:
            try:
                results = con.execute(stm).all()
                surveys_with_status = []
                for survey, has_submission in results:
                    survey_dict = {
                        "survey": survey,
                        "submited": has_submission
                    }
                    surveys_with_status.append(survey_dict)
                return Result(True, {"surveys": surveys_with_status}) 
            except Exception:
                return Result(False,{"reason":"Could not get the surveys"})

    def get_surveys_public(self,access_token:str,include_q = False)->Result:
        token_res = verify_token(access_token)

        user_id = ""

        if token_res.success and "id" in token_res.keys["claims"] :
            user_id = token_res.keys["claims"]["id"]

        
        stm = select(
            Surveys,
            exists().where(
                and_(
                    Submissions.survey_id == Surveys.id,
                     Submissions.user_id == user_id  
                )
            ).label("submited")
        ).where((Surveys.is_public == True) & (Surveys.state == SurveyState.PUBLISHED))


        if (include_q):
            stm = stm.options(
                selectinload(Surveys.questions)
            )


        with dbConnection() as con:
            try:
                results = con.execute(stm).all()
                surveys_with_status = []
                for survey, has_submission in results:
                    survey_dict = {
                        "survey": survey,
                        "submited": has_submission
                    }
                    surveys_with_status.append(survey_dict)
                return Result(True, {"surveys": surveys_with_status})
            except Exception:
                return Result(False,{"reason":"Could not get the surveys"})


    def get_surveys_submitted(self,access_token:str,include_q = False)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]



        stm = select(Surveys).where(
            exists().where(
                (Submissions.survey_id == Surveys.id) & 
                    (Submissions.user_id == user_id)
            )
        )

        if (include_q):
            stm = stm.options(
                selectinload(Surveys.questions)
            )


        with dbConnection() as con:
            try:
                surveys = con.execute(stm).scalars().all()
                return Result(True,{"surveys": surveys}) 
            except Exception:
                return Result(False,{"reason":"Could not get the surveys"})


    def publish_survey_by_id(self,id:str, access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]
        res = {}
        stm = select(Surveys).where(Surveys.id == id)

        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar_one_or_none()

                if survey == None:
                    return Result(False,{"reason": "Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                # i have created the survey 
                if survey.owner_id != user_id:
                    res["survey"] = survey
                    return Result(False,{"reason": "Not authorized", "status_code" : status.HTTP_403_FORBIDDEN })

                if survey.state != SurveyState.CREATED:
                    return Result(False,{"reason": "Could not publish survey", "status_code" : status.HTTP_400_BAD_REQUEST })


                survey.state = SurveyState.PUBLISHED 

                con.commit()
                con.refresh(survey)

                res["survey"] = survey
                return Result(True,res)
            except Exception:
                return Result(False,{"reason":"Could not get the survey"})


    def submit_survey(self,data:SubmitSurveyForm,access_token:str,survey_id:str)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]

        submission_exist_stm = select(Submissions).where(and_(
            Submissions.survey_id == survey_id,
            Submissions.user_id == user_id
        ))

        s_ids = [x.id for x in data.responses]

        q_count_included = select(
            func.count(Questions.id)
        ).where(and_(
            Questions.survey_id == survey_id,
            Questions.id.in_(s_ids)
        )).scalar_subquery()

        q_count = select(
            func.count(Questions.id)
        ).where(and_(
            Questions.survey_id == survey_id,
        )).scalar_subquery()

        q_count_stm = select(
            q_count_included.label("total_answers"),
            q_count.label("total_questions")
        )

        responses:list = []


        submission_id = generate_id(48,"SMT")
        submission = Submissions(id=submission_id,survey_id=survey_id,user_id=user_id)

        for q in data.responses:
            answer_id = generate_id(48,"ANS")
            r = {
                "id": answer_id,
                "submission_id": submission_id,
                "question_id": q.id,
                "answer_text" : "",
                "answer_bool" : False,
                "answer_number" : 0,
                "answer_json" : "",
            }

            match q.type:
                case "TEXT":
                    r["answer_text"] = q.response
                    pass

                case "NUMBER":
                    r["answer_number"] = float(q.response) 
                    pass

                case "RATING":
                    r["answer_number"] = float(q.response) 
                    pass

                case "BOOL":
                    r["answer_bool"] = bool(q.response) 
                    pass

            responses.append(r)

        insertStm = insert(Answers).values(responses)
        insertStm = insertStm.on_conflict_do_update(
            index_elements=['id'],
            set_={
                'answer_text': insertStm.excluded.answer_text,
                'answer_number': insertStm.excluded.answer_number,
                'answer_bool': insertStm.excluded.answer_bool,
                'answer_json': insertStm.excluded.answer_json,
            }
        )

        with dbConnection() as con:
            try:
                sb = con.execute(submission_exist_stm).scalar()

                if sb:
                    return Result(False,{"reason": "Submission already exist for this survey", "status_code" : status.HTTP_409_CONFLICT })

                q_count = con.execute(q_count_stm).all()

                (total_answers,total_questions) = q_count[0] 

                if (total_answers != total_questions):
                    return Result(False,{"reason": "Some answer have no response", "status_code" : status.HTTP_400_BAD_REQUEST })


                con.add(submission)
                con.execute(insertStm)
                con.commit()
                return Result(True, {"submission":submission,"answers": responses})
            except Exception :
                return Result(False,{"reason": "Could not submit the survey" })


    def get_survey_by_id(self,id:str, access_token:str, key:str | None = None, include_questions = False)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]
        res = {}

        stm = select(
            Surveys,
            exists().where(
                and_(
                    Submissions.survey_id == Surveys.id,
                    Submissions.user_id == user_id  
                )
            ).label("submited")
        ).where(Surveys.id == id)



        if (include_questions):
            stm = stm.options(
                selectinload(Surveys.questions)
            )

        with dbConnection() as con:
            try:
                result = con.execute(stm).all()

                if len(result) ==0:
                    return Result(False,{"reason": "Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                (survey,submited) = result[0]


                if survey == None:
                    return Result(False,{"reason": "Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                # i have created the survey 
                if survey.owner_id == user_id:
                    res["data"] =  {
                        "survey": survey,
                        "submited": submited 
                    }
                    return Result(True,res)

                # i have a valid key for the survey
                for k in survey.keys:
                    if k.value == key:
                        res["data"] =  {
                            "survey": survey,
                            "submited": submited 
                        }
                        return Result(True,res)

                # i alreary have completed the survey
                if submited :
                    res["data"] =  {
                        "survey": survey,
                        "submited": submited 
                    }
                    return Result(True,res)


                # publick survey
                if survey.is_public and survey.state == SurveyState.PUBLISHED:
                    res["data"] =  {
                        "survey": survey,
                        "submited": submited 
                    }
                    return Result(True,res)

                return Result(False,{"reason":"Could not get the survey", "status_code" : status.HTTP_403_FORBIDDEN })

            except Exception:
                return Result(False,{"reason":"Could not get the survey"})

