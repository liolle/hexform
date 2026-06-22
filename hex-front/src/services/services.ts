import Client, { ClientResponse } from "~/state/httpClient"
import { SetStore, Store, StoreType } from "~/state/store"


class AuthService {

  async login(data: object): Promise<ClientResponse> {

    let response = await Client.post("login")
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withBody(data)
      .send()

    return response
  }

  async logout() {
    SetStore({
      ...Store,
      dashboardSurveys: [],
      publcSurveys: [],
      user: undefined,
      accessToken: "",
      apiCache: {}
    } as StoreType);

    return;
  }

  async register(data: object): Promise<ClientResponse> {

    let response = await Client.post("register")
      .withHeaders([
        ["Content-Type", "application/json"]
      ]).withBody(data)
      .send()

    return response
  }
}

export const AuthS = new AuthService()
