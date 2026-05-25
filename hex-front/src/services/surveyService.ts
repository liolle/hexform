import Client, { ClientResponse } from "~/state/httpClient"

export interface SurveyData {

  id: string
  title: string
  description: string

  owner_id: string
  is_public: boolean
  created_at: Date
}


class SurveyService {

  async getCreateSurveys(include_questions = false): Promise<ClientResponse> {

    let response = await Client.get(`surveys/created?include_questions=${include_questions}`)
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withAuth()
      .send()

    return response
  }


}


export const SurveyS = new SurveyService()
