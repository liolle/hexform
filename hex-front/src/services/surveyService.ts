import DB, { DBStoreNames } from "~/state/database"
import Client, { ClientResponse } from "~/state/httpClient"
import { CachedQuestions, SurveyAnswer, SurveyAnswers, SurveyQuestion } from "~/types"



class SurveyService {

  /* Command  */

  async getCreateSurveys(include_questions = false): Promise<ClientResponse> {

    let response = await Client.get(`surveys/created?include_questions=${include_questions}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .withCache()
      .send()

    return response
  }

  async getPublicSurveys(include_questions = false): Promise<ClientResponse> {

    let response = await Client.get(`surveys/public?include_questions=${include_questions}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .send()

    return response
  }

  async getSurvey(surveyId: string, include_questions = false): Promise<ClientResponse> {

    let response = await Client.get(`surveys/${surveyId}?include_questions=${include_questions}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .withCache()
      .send()

    return response
  }

  /* Queries  */

  async createSurvey(data: object): Promise<ClientResponse> {
    let response = await Client.post(`surveys`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .withBody(data)
      .send()

    return response
  }

  async updateSurveyQuestion(data: object, surveyId: string): Promise<ClientResponse> {
    let response = await Client.patch(`surveys/${surveyId}/questions`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .withBody(data)
      .send()

    return response
  }

  async deleteSurvey(id: string): Promise<ClientResponse> {
    let response = await Client.delete(`surveys/${id}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .send()

    return response
  }

  async publishSurvey(id: string): Promise<ClientResponse> {
    let response = await Client.post(`surveys/${id}/publish`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .send()

    return response
  }

  async sendSurvey(surveyId: string, is_preview: boolean): Promise<boolean> {

    let data = await DB.getFromKey(DBStoreNames.SURVEY_ANSWERS, surveyId) as SurveyAnswers
    if (!data) {
      return false
    }

    await DB.deleteFromKey(DBStoreNames.SURVEY_ANSWERS, surveyId)

    if (is_preview) {
      // Send survey
      console.log("send", data)
    }
    return true

  }

  /* Invalidate */

  async invalidateSurvey(surveyId: string) {

    let keys: [DBStoreNames, string][] = [
      [DBStoreNames.API_CACHE, "surveys/created"],
      [DBStoreNames.API_CACHE, "surveys/public"],
      [DBStoreNames.API_CACHE, `surveys/${surveyId}`],
    ]

    for (const elem of keys) {
      DB.deleteFromKey(elem[0], elem[1])
    }
  }


  /* Sync */

  async resolveQuestions(surveyId: string, questions: SurveyQuestion[]): Promise<SurveyQuestion[]> {

    let local_questions = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: questions
    }

    if (!local_questions) {
      DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)
    }


    let intersection: SurveyQuestion[] = []
    let qMap = new Map<string, SurveyQuestion>()

    for (const q of questions) {
      qMap.set(q.id, q)
    }

    for (const q of local_questions.questions) {
      let qx = qMap.get(q.id)
      if (!qx) {
        qMap.set(q.id, q)
        continue
      }
      let d1 = new Date(q.last_modified)
      let d2 = new Date(qx.last_modified)

      if (d1 > d2) {
        qMap.set(q.id, q)
      }
    }

    intersection = qMap.values().toArray()

    data.questions = intersection
    DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)

    return intersection
  }


  async resolveAnswers(surveyId: string, answers: SurveyAnswers): Promise<SurveyAnswers> {

    let savedAnswers = await DB.getFromKey(DBStoreNames.SURVEY_ANSWERS, surveyId) as SurveyAnswers

    if (!savedAnswers) {
      return answers
    }

    let res: SurveyAnswers = {
      survey_id: answers.survey_id,
      position: savedAnswers.position,
      responses: []
    }

    let map = new Map<string, SurveyAnswer>

    for (const ans of savedAnswers.responses) {
      map.set(ans.questionId, ans)
    }


    for (let i = 0; i < answers.responses.length; i++) {
      let ans = answers.responses[i];
      let saved = map.get(ans.questionId)
      if (!saved) {
        res.responses.push(ans)
        continue
      }
      ans.response = saved.response
      res.responses.push(ans)
    }

    return res
  }
}


export const SurveyS = new SurveyService()
