import DB, { DBStoreNames } from "~/state/database"
import Client, { ClientResponse } from "~/state/httpClient"
import AppState from "~/state/state"


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
    AppState.accessToken = undefined
    await DB.deleteFromKey(DBStoreNames.API_CACHE, "")
    return
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
