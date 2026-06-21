import { unwrap } from "solid-js/store"
import Client, { CachedClientResponse, CachedRequest, ClientResponse } from "~/state/httpClient"
import AppState from "~/state/state"
import { SetStore, Store } from "~/state/store"
import { CachedQuestions, SurveyAnswer, SurveyAnswers, SurveyQuestion, SurveyStat } from "~/types"



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
    console.log(data)
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

    let questions = unwrap(Store.surveyQuestions[surveyId])


    if (!questions) {
      return false
    }

    for (const ans of questions) {
      AppState.handleAnswerError(surveyId, ans)
    }

    let errors = unwrap(Store.surveyAnswersErrors[surveyId])

    if (errors && errors.length > 0) {

      return false
    }

    if (is_preview) {
      // Send survey
      return true
    }

    let answers = unwrap(Store.surveyAnswers[surveyId])

    let data = answers.map(v => {
      return {
        id: v.questionId,
        response: v.response,
        type: v.type
      }
    })

    let response = await Client.post(`survey/${surveyId}/submit`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .withBody({
        responses: data
      })
      .send()


    SetStore("surveyAnswers", surveyId, (prev) => [])
    return true
  }

  async getSurveyStats(surveyId: string): Promise<ClientResponse> {

    let response = await Client.get(`survey/${surveyId}/stats`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .send()


    return response
  }

  /* Invalidate */

  async invalidateSurvey(surveyId: string) {

    let createdReg = /surveys\/created/
    let publicReg = /surveys\/public/
    let surveyReg = new RegExp(`surveys/${surveyId}`)

    SetStore("apiCache", (prev) => {
      let res: Record<string, CachedRequest> = {}

      for (const key in prev) {
        if (createdReg.test(key) || publicReg.test(key) || surveyReg.test(key)) {
          continue
        }

        res[key] = prev[key]
      }

      return res
    })
  }


  /* Sync */

  async resolveQuestions(surveyId: string, questions: SurveyQuestion[]): Promise<SurveyQuestion[]> {

    let local_questions = unwrap(Store.surveyQuestions[surveyId])
    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: questions
    }


    if (!local_questions) {
      SetStore("surveyQuestions", surveyId, (prev) => [...questions])
      local_questions = questions
    }


    let comb: SurveyQuestion[] = []
    let qMap = new Map<string, SurveyQuestion>()

    for (const q of questions) {
      qMap.set(q.id, q)
    }

    for (const q of local_questions) {
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

    comb = qMap.values().toArray()

    data.questions = comb
    SetStore("surveyQuestions", surveyId, (prev) => [...comb])

    return comb
  }


  resolveAnswers(surveyId: string, answers: SurveyAnswers): SurveyAnswers {

    let savedAnswers = Store.surveyAnswers[surveyId]

    if (!savedAnswers) {
      return answers
    }

    let res: SurveyAnswers = {
      survey_id: answers.survey_id,
      position: 0,
      responses: []
    }

    let map = new Map<string, SurveyAnswer>

    for (const ans of savedAnswers) {
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

