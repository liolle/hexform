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
    AppState.connected = false
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
