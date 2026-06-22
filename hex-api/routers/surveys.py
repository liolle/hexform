from fastapi import APIRouter, Depends, HTTPException, status

from dto import CreateSurveyForm, UpdateSurveyQuestionForm, SubmitSurveyForm
from services import SurveyService, verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


#if TYPE_CHECKING:

router = APIRouter()
security = HTTPBearer()

@router.patch("/surveys/{id}/questions")
def patch_survey_quetions(data:UpdateSurveyQuestionForm, 
                id:str,
                surveys:SurveyService = Depends(SurveyService),
                credentials: HTTPAuthorizationCredentials = Depends(security)):

    res = surveys.update_survey_questions(data.questions,id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys

@router.get("/survey/{id}/stats")
def get_survey_stats(id:str,
surveys:SurveyService = Depends(SurveyService),
                     credentials: HTTPAuthorizationCredentials = Depends(security)):
    res = surveys.get_survey_stats(id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys


@router.post("/survey/{id}/submit")
def submit_survey(data:SubmitSurveyForm, id:str,
                  surveys:SurveyService = Depends(SurveyService),
                  credentials: HTTPAuthorizationCredentials = Depends(security)
                  ):

    res = surveys.submit_survey(data,credentials.credentials,id)
    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys


@router.get("/survey/{id}/keys")
def get_survey_keys( id:str,
                  surveys:SurveyService = Depends(SurveyService),
                  credentials: HTTPAuthorizationCredentials = Depends(security)
                  ):

    res = surveys.get_survey_keys(id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys





@router.post("/surveys/{id}/publish")
def publish_survey_quetions( 
    id:str,
    surveys:SurveyService = Depends(SurveyService),
        credentials: HTTPAuthorizationCredentials = Depends(security)):

    res = surveys.publish_survey_by_id(id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys


@router.get("/surveys/{id}/questions")
def get_survey_quetions(id:str,
                        surveys:SurveyService = Depends(SurveyService),
                        credentials: HTTPAuthorizationCredentials = Depends(security)):

    res = surveys.get_survey_questions(id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )


    return res.keys


@router.patch("/surveys/{id}")
def patch_survey(data:CreateSurveyForm, 
                 id:str,
                 surveys:SurveyService = Depends(SurveyService),
                 credentials: HTTPAuthorizationCredentials = Depends(security)):

    res = surveys.update_survey(data,id,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys

@router.post("/surveys")
def create_survey(data:CreateSurveyForm, 
                  surveys:SurveyService = Depends(SurveyService),
                  credentials: HTTPAuthorizationCredentials = Depends(security)):

    res = surveys.create_survey(data,credentials.credentials)

    if not res.success: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys

@router.delete("/surveys/{id}")
def delete_survey(id:str, surveys:SurveyService = Depends(SurveyService),credentials: HTTPAuthorizationCredentials = Depends(security)):
    res = surveys.delete_survey(id, credentials.credentials)
    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return  

@router.get("/surveys/created")
def get_survey_created( surveys:SurveyService = Depends(SurveyService),
                       credentials: HTTPAuthorizationCredentials = Depends(security),
                       include_questions:bool = False,
                       ):

    res = surveys.get_surveys_created_by( credentials.credentials, include_q=include_questions)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys 

@router.get("/surveys/public")
def get_survey_public( surveys:SurveyService = Depends(SurveyService),
                      credentials: HTTPAuthorizationCredentials = Depends(security),
                      include_questions:bool = False,
                      ):

    res = surveys.get_surveys_public(credentials.credentials,include_q=include_questions)

    if not res.success: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys 

@router.get("/surveys/submitted")
def get_survey_submitted( surveys:SurveyService = Depends(SurveyService),
                         credentials: HTTPAuthorizationCredentials = Depends(security),
                         include_questions:bool = False,
                         ):

    res = surveys.get_surveys_submitted(credentials.credentials,include_q=include_questions)

    if not res.success: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return res.keys 


@router.get("/surveys/{id}")
def get_survey(id:str, 
               surveys:SurveyService = Depends(SurveyService),
               credentials: HTTPAuthorizationCredentials = Depends(security),
               include_questions:bool = False,
               key:str|None = None,
               ):

    res = surveys.get_survey_by_id(id, credentials.credentials,key=key,include_questions=include_questions)

    if not res.success: 
        raise HTTPException(
            status_code=res.keys["status_code"] if "status_code" in res.keys else status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )


    return res.keys 
