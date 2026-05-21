import { createSignal } from "solid-js"

class State {
  static NAME = "hexform-state"

  #loaded = false
  #connected = false
  #accessToken: string | undefined = undefined

  constructor() {
    // Load state from local storate
    this.#load()
  }

  #save() {
    localStorage.setItem(State.NAME, JSON.stringify({
      connected: this.#connected,
      accessToken: this.#accessToken,
    }))
  }

  #load() {

    let state = localStorage.getItem(State.NAME)

    if (!state) {
      return
    }

    try {
      let jsonState = JSON.parse(state)

      this.#connected = jsonState["connected"] ?? false
      this.#accessToken = jsonState["accessToken"]

    } catch (error) {
      console.log("Failed to load state")
    }
    this.#loaded = true
  }


  // Getter
  get accessToken(): string | undefined {
    if (!this.#loaded) {
      this.#load()
    }
    return this.#accessToken
  }

  get connected(): boolean {
    if (!this.#loaded) {
      this.#load()
    }
    return this.#connected
  }


  // Setter
  set accessToken(token: string | undefined) {
    this.#accessToken = token
    this.#save()
  }

  set connected(connected: boolean) {
    this.#connected = connected
    this.#save()
  }
}


let AppState = new State()




export default AppState




