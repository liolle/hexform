import { string } from "zod"
import AppState from "./state"
import { json } from "@solidjs/router"


enum RequestMethod {
  "POST" = "POST",
  "GET" = "GET",
  "PATCH" = "PATCH",
  "PUT" = "PUT"
}

export interface ClientResponseType {
  status: number
  content: Map<string, any>
}

export class ClientResponse {

  #request: ClientRequest
  #result: ClientResponseType

  constructor(request: ClientRequest, result: ClientResponseType) {
    this.#request = request
    this.#result = result
  }

  get request(): ClientRequest {
    return this.#request
  }

  get result(): ClientResponseType {
    return this.#result
  }
}

export class ClientRequest {
  #url: string = "http://localhost"
  #method: RequestMethod = RequestMethod.GET
  #headers: [string, string][] = []
  #body: string | undefined = undefined

  constructor(url: string, method: RequestMethod) {
    this.#url = url
    this.#method = method
  }

  withAuth(): ClientRequest {
    let token = AppState.accessToken
    if (!token) { return this }
    this.#headers.push(["Authorization", `Bearer ${token}`])
    return this
  }

  withHeaders(headers: [string, string][]): ClientRequest {

    for (const header of headers) {
      this.#headers.push(header)
    }

    return this
  }

  withBody(body: object): ClientRequest {
    try {
      this.#body = JSON.stringify(body)
    } catch (error) {
      console.log(error)
    }

    return this
  }


  async send(): Promise<ClientResponse> {
    let options: RequestInit = {
      method: this.#method.toString(),
      headers: this.#headers,
      body: this.#body
    }

    let res: Map<string, any> = new Map()

    const response = await fetch(this.#url, options);

    try {
      let json = await response.json()

      for (const el in json) {
        res.set(el, json[el])
      }

    } catch (error) {

    }

    return new ClientResponse(this, {
      status: response.status,
      content: res
    })
  }
}

class HttpClient {
  #baseURL = "http://localhost"

  constructor(baseURL: string) {
    this.#baseURL = baseURL
  }


  get(path: string): ClientRequest {

    return new ClientRequest(`${this.#baseURL}/${path}`, RequestMethod.GET)
  }

  post(path: string) {

    return new ClientRequest(`${this.#baseURL}/${path}`, RequestMethod.POST)
  }

  put(path: string) {

    return new ClientRequest(`${this.#baseURL}/${path}`, RequestMethod.PUT)
  }

  patch(path: string) {

    return new ClientRequest(`${this.#baseURL}/${path}`, RequestMethod.PATCH)
  }
}


const Client = new HttpClient("http://localhost:8000")


export default Client
