import DB, { DBStoreNames } from "~/state/database"
import Client, { ClientResponse } from "~/state/httpClient"
import { CachedQuestions, SurveyQuestion } from "~/types"



class SurveyService {

  /* Command  */

  async getCreateSurveys(include_questions = false): Promise<ClientResponse> {

    let response = await Client.get(`surveys/created?include_questions=${include_questions}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
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

  /* Invalidate */

  async invalidateSurvay(surveyId: string) {
    let response = await this.getSurvey(surveyId, true)
    if (!response.cached) {
      return
    }
    let url = response.request.url.split("?")[0]

    let key = `${response.request.method}:${url}`
    DB.deleteFromKey(DBStoreNames.API_CACHE, key)
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

    let pattern = "^TEMP-.*"
    let exp = new RegExp(pattern)

    for (const q of local_questions.questions) {
      if (exp.test(q.id)) {
        intersection.push(q)
        continue
      }

      let qx = qMap.get(q.id)
      if (!qx) {
        continue
      }

      if (qx.last_modified < q.last_modified) {

        intersection.push(q)
      } else {

        intersection.push(qx)
      }
    }

    data.questions = intersection
    DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)

    return intersection
  }

}


export const SurveyS = new SurveyService()
