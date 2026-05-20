
class State {
  static NAME = "hexform-state"

  connected = false

  constructor() {
    // Load state from local storate
    this.#load()
  }

  #save() {
    let state = localStorage.setItem(State.NAME, JSON.stringify(this))
  }

  #load() {

    let state = localStorage.getItem(State.NAME)

    if (state === null) {
      return
    }

    try {
      let jsonState = JSON.parse(state)

      console.log(jsonState)

    } catch (error) {
      console.log("Failed to load state")
    }
  }
}

let AppState = new State()

export default AppState




