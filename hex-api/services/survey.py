from datetime import datetime
from operator import and_
from sqlalchemy import Boolean, delete, func, insert, select, exists, and_, text
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql.functions import count
from dto import SurveyData, CreateSurveyForm, SurveyQuestionForm, SubmitSurveyForm
from database import Surveys, SurveyState,Submissions, Questions, Answers,SurveyKeys, QType, dbConnection
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

    def delete_survey(self, survey_id:str, access_token:str):
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]

        stm = select(Surveys).where(Surveys.id == survey_id )

        delStm = delete(Surveys).where(
            Surveys.id == survey_id
        )

        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar_one_or_none()
                if survey == None:
                    return Result(False,{"reason":"Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.owner_id != user_id :
                    return Result(False,{"reason":"Could not delete the survey", "status_code" : status.HTTP_403_FORBIDDEN })

                con.execute(delStm)
                con.commit()
            except Exception as e :
                print(e)
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


    def get_survey_stats(self, survey_id:str, access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token"})

        user_id = token_res.keys["claims"]["id"]


        stm = select(Surveys).where(Surveys.id == survey_id )

        cnt_submissions_stm = select(
            func.count(Submissions.id)
        ).where(and_(
            Submissions.survey_id == survey_id
        )).scalar_subquery()

        query = text("""
            WITH text_answers AS (
                SELECT 
                    q.id AS question_id,
                    q.title,
                    a.answer_text
                FROM submissions sb
                LEFT JOIN answers a ON a.submission_id = sb.id 
                LEFT JOIN questions q ON q.id = a.question_id 
                WHERE sb.survey_id = :survey_id
                    AND q.type = 'TEXT'
                    AND a.answer_text IS NOT NULL
                    AND a.answer_text != ''
            ),
            word_freq AS (
                SELECT 
                    question_id,
                    title,
                    word,
                    COUNT(*) AS frequency,
                    ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY COUNT(*) DESC) AS rank
                FROM text_answers,
                LATERAL regexp_split_to_table(lower(answer_text), '\\s+') AS word
                WHERE length(word) > 2
                    AND word NOT IN ('the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'would','can', 'have')
                GROUP BY question_id, title, word
            ),
            all_stats AS (
                SELECT 
                    q.id AS question_id,
                    q.title,
                    q.type,
                    q.config,
                    COUNT(DISTINCT sb.id) AS total_submissions,
                    COUNT(a.id) AS total_answers,
                    
                -- Numeric stats
                CASE WHEN q.type IN ('NUMBER', 'RATING') 
                    THEN ROUND(AVG(a.answer_number)::numeric, 2) 
                    ELSE NULL 
                END AS avg_number,
                CASE WHEN q.type IN ('NUMBER', 'RATING') 
                    THEN MIN(a.answer_number) 
                    ELSE NULL 
                END AS min_number,
                CASE WHEN q.type IN ('NUMBER', 'RATING') 
                    THEN MAX(a.answer_number) 
                    ELSE NULL 
                END AS max_number,
                
                -- Boolean stats
                CASE WHEN q.type = 'BOOL' 
                    THEN SUM(CASE WHEN a.answer_bool = true THEN 1 ELSE 0 END) 
                    ELSE NULL 
                END AS true_count,
                CASE WHEN q.type = 'BOOL' 
                    THEN SUM(CASE WHEN a.answer_bool = false THEN 1 ELSE 0 END) 
                    ELSE NULL 
                END AS false_count,
                
                -- Text stats (will be filled separately)
                NULL AS top_5_words
                
            FROM submissions sb
            LEFT JOIN answers a ON a.submission_id = sb.id 
            LEFT JOIN questions q ON q.id = a.question_id 
            WHERE sb.survey_id = :survey_id
            GROUP BY q.id, q.title, q.type
        )


        SELECT 
            as2.*,
            CASE WHEN as2.type = 'TEXT' THEN (
                SELECT STRING_AGG(concat(word, '-', frequency), ',' ORDER BY rank)
                FROM word_freq wf
                WHERE wf.question_id = as2.question_id
                    AND wf.rank <= 5
            ) ELSE NULL END AS top_5_words_filled
        FROM all_stats as2
        ORDER BY question_id;        
        """)
 
        results = []
        submission_count = 0
        question_config = ""
        
        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar()

                if not survey : 
                    return Result(False,{"reason":"Could not find the survey stats", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.state == SurveyState.CREATED:
                    return Result(False,{"reason":"The survey is not published"})

                res = con.execute(query,{"survey_id":survey_id}).all()


                for row in res:

                    q_stat = {}
                    (question_id,
                        question_title,
                        question_type,
                        question_config,
                        total_submissions,
                        total_answers,
                        avg_num,
                        min_num,
                        max_num,
                        true_count,
                        false_count, 
                        other,
                        top_5_words
                    ) = row

                    q_stat["id"] = question_id
                    q_stat["title"] = question_title
                    q_stat["type"] = question_type
                    q_stat["config"] = question_config if question_config else ""
                    submission_count = total_submissions

                    match question_type:
                        case "TEXT":
                            q_stat["content"] = {"top_words" : top_5_words.split(",")}
                            pass

                        case "NUMBER":
                            q_stat["content"] = {"min":min_num,"max":max_num,"avg":avg_num}
                            pass

                        case "BOOL":
                            q_stat["content"] = {"true_count":true_count,"false_count":false_count}
                            pass

                        case "RATING":
                            q_stat["content"] = {"min":min_num,"max":max_num,"avg":avg_num}
                            pass
                    results.append(q_stat)
                

                return Result(True,{"submission_count":submission_count,"stats":results}) 
            except Exception as e:
                print(e)
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


    def publish_survey_by_id(self,survey_id:str, access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]
        res = {}
        stm = select(Surveys).where(Surveys.id == survey_id)

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

                if not survey.is_public:
                    key_id = generate_id(42,"SVK")
                    key = generate_id(60,"")

                    survey_key = {
                        "id": key_id,
                        "survey_id": survey_id,
                        "value": key  
                    }

                    insertStm = insert(SurveyKeys).values(survey_key)
                    con.execute(insertStm)

                con.commit()
                con.refresh(survey)

                res["survey"] = survey
                return Result(True,res)
            except Exception:
                return Result(False,{"reason":"Could not get the survey"})

    def get_survey_keys(self,survey_id:str,access_token:str)->Result:
        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res


        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]

        stm = select(Surveys).where(Surveys.id == survey_id)


        with dbConnection() as con:
            try:
                survey = con.execute(stm).scalar()

                if survey == None:
                    return Result(False,{"reason": "Not found", "status_code" : status.HTTP_404_NOT_FOUND })

                if survey.owner_id != user_id :
                    return Result(False,{"reason": "Not allowed", "status_code" : status.HTTP_403_FORBIDDEN })


                keys = [x.value for x in survey.keys]

                return Result(True, {"keys": keys}) 

            except Exception :
                return Result(False,{"reason": "Could not get survey keys" })


    true_values = {'true', '1', 'yes', 'y', 'on', 't', 'ok', 'agree', 'positive'}

    def submit_survey(self,data:SubmitSurveyForm,access_token:str,survey_id:str)->Result:

        token_res = verify_token(access_token)

        if not token_res.success: 
            return token_res

        if not "id" in token_res.keys["claims"]:
            return Result(False,{"reason":"Malformed access token" })

        user_id = token_res.keys["claims"]["id"]

        survey_select_stm = select(Surveys).where(Surveys.id == survey_id)

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
                    r["answer_bool"] = True if q.response.lower() in self.true_values else False 
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
                survey = con.execute(survey_select_stm).scalar()

                if not survey  or survey.state != SurveyState.PUBLISHED:
                    return Result(False,{"reason": "Survey is not published" })

                keys = [x.value for x in survey.keys] 

                if not survey.is_public and not data.key in keys :
                    return Result(False,{"reason": "Invalid submission key", "status_code" : status.HTTP_403_FORBIDDEN  })


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

