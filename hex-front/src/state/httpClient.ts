import { unwrap } from "solid-js/store"
import DB, { DBStoreNames } from "./database"
import AppState from "./state"
import { SetStore, Store } from "./store"


const BASE_API_URL = import.meta.env.VITE_API_URL || '';

enum RequestMethod {
  "POST" = "POST",
  "GET" = "GET",
  "PATCH" = "PATCH",
  "DELETE" = "DELETE",
  "PUT" = "PUT"
}

export interface ClientResponseType {
  status: number
  content: Record<string, any>
}

export interface CachedClientResponse {
  date: Date
  response: ClientResponse
}

export interface ClientResponse {
  request: ClientRequest
  result: ClientResponseType
  cached: boolean
}

export interface CachedRequest {
  request: string
  response: ClientResponse
  last_modified: Date
}

export class ClientRequest {
  url: string = BASE_API_URL
  method: RequestMethod = RequestMethod.GET
  headers: [string, string][] = []
  body: string | undefined = undefined

  #cachedResponse: ClientResponse | null = null
  #needCache: boolean = false


  constructor(url: string, method: RequestMethod) {
    this.url = url
    this.method = method
  }

  withAuth(): ClientRequest {
    let token = AppState.accessToken
    if (!token) { return this }
    this.headers.push(["Authorization", `Bearer ${token}`])
    return this
  }

  withHeaders(headers: [string, string][]): ClientRequest {

    for (const header of headers) {
      this.headers.push(header)
    }

    return this
  }

  withBody(body: object): ClientRequest {
    try {
      this.body = JSON.stringify(body)
    } catch (error) {
      console.log(error)
    }

    return this
  }

  withCache(): ClientRequest {
    this.#needCache = true
    return this
  }

  async #checkCache() {
    let key = `${this.method}:${this.url}`
    let res = unwrap(Store.apiCache[key])
    if (!res) {
      return this
    }
    let now = new Date(Date.now())
    let cachedDate = new Date(res.last_modified)

    let elapse = now.getTime() - cachedDate.getTime()
    if (elapse < 60000) {
      res.response.cached = true
      this.#cachedResponse = res.response
      return this
    }

    return this
  }


  async send(): Promise<ClientResponse> {

    if (this.#needCache) {
      await this.#checkCache()
    }

    if (this.#cachedResponse) {
      return this.#cachedResponse
    }

    let options: RequestInit = {
      method: this.method.toString(),
      headers: this.headers,
      body: this.body
    }


    let res: Record<string, any> = {}

    const response = await fetch(this.url, options);

    try {
      let json = await response.json()

      for (const el in json) {
        res[el] = json[el]
      }

    } catch (error) {

    }

    const result = {
      request: this,
      result: {
        status: response.status,
        content: res
      },
      cached: false
    }


    if (this.#needCache && result.result.status < 300) {
      let now = new Date(Date.now())
      let key = `${this.method}:${this.url}`

      let cachedR: CachedRequest = {
        request: key,
        response: result,
        last_modified: now,
      }

      SetStore("apiCache", key, (prev) => cachedR)
    }

    return result
  }
}

class HttpClient {
  #baseURL = BASE_API_URL

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

  delete(path: string) {

    return new ClientRequest(`${this.#baseURL}/${path}`, RequestMethod.DELETE)

  }
}

const Client = new HttpClient(BASE_API_URL)

export default Client
