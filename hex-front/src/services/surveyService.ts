import DB from "~/state/database"
import Client, { CachedClientResponse, ClientResponse } from "~/state/httpClient"

export enum SurveyState {
  CREATED = "CREATED",
  PUBLISHED = "PUBLISHED",
  DONE = "DONE"
}

export interface SurveyData {
  id: string
  title: string
  description: string
  state: SurveyState
  owner_id: string
  is_public: boolean
  created_at: Date
}


class SurveyService {

  #default_invalidation_timeout = 60000

  #fromCache(request: string): ClientResponse | null {

    let now = Date.now()

    let cache = localStorage.getItem(request)

    if (cache) {
      let cachedResponse: CachedClientResponse = JSON.parse(cache)
      console.log(cachedResponse)
    }

    return null

  }

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

}


export const SurveyS = new SurveyService()
