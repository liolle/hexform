import { SurveyData, SurveyS } from "~/services/surveyService";
import { HomeTabType, SetStore, Store, UserData } from "./store"
import { AuthS } from "~/services/services";

function decodeJWT(token: string) {
  try {
    const [header, payload, signature] = token.split('.');

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(base64);

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Invalid JWT:', error);
    return null;
  }
}


class State {
  static NAME = "hexform-state"

  #loaded = false
  #connected = false
  #accessToken: string | undefined = undefined
  #activeHomeTab: HomeTabType = HomeTabType.DASHBOARD
  #activeDashboardSurveyId: string = ""


  constructor() {
    // Load state from local storate

    this.#load()
  }

  #save() {
    localStorage.setItem(State.NAME, JSON.stringify({
      connected: this.connected,
      accessToken: this.accessToken,
      activeHomeTab: this.activeHomeTab,
      activeDashboardSurveyId: this.#activeDashboardSurveyId
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
      this.#activeHomeTab = jsonState["activeHomeTab"]
      this.#activeDashboardSurveyId = jsonState["activeDashboardSurveyId"]


      this.#setClaims(this.#accessToken)
      SetStore("activeHomeTab", this.#activeHomeTab)
      SetStore("activeDashboardSurveyId", this.#activeDashboardSurveyId)

    } catch (error) {
      console.log("Failed to load state")
      console.log(error, state)
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

  get activeDashboardSurveyId(): string {
    if (!this.#loaded) {
      this.#load()
    }

    return this.#activeDashboardSurveyId
  }


  get connected(): boolean {
    if (!this.#loaded) {
      this.#load()
    }
    return this.#connected
  }

  get activeHomeTab(): HomeTabType {
    if (!this.#loaded) {
      this.#load()
    }


    return this.#activeHomeTab
  }

  #setClaims(token: string | undefined) {
    if (token) {



      try {
        let data = decodeJWT(token)

        if (data && data["id"] && data["id"]) {
          let user: UserData = {
            nickname: data["nickname"],
            id: data["id"],
            email: data["email"]
          }

          SetStore("user", user)
        }

      } catch (error) {

        SetStore("user", undefined)
      }

    } else {

      SetStore("user", undefined)
    }
  }


  // Setter
  set accessToken(token: string | undefined) {
    if (this.accessToken == token) {
      return
    }

    this.#accessToken = token
    this.#setClaims(token)
    this.#save()
  }

  set activeHomeTab(tab: HomeTabType) {
    if (this.activeHomeTab == tab) {
      return
    }

    this.#activeHomeTab = tab
    SetStore("activeHomeTab", this.#activeHomeTab)
    this.#save()
  }

  set connected(connected: boolean) {
    if (this.connected == connected) {
      return
    }

    this.#connected = connected

    this.#save()
  }

  set activeDashboardSurveyId(id: string) {
    if (this.activeDashboardSurveyId == id) {
      return
    }

    this.#activeDashboardSurveyId = id
    SetStore("activeDashboardSurveyId", id)

    this.#save()
  }

  async updateDashboardSurveys() {

    let res = await SurveyS.getCreateSurveys(true)
    if (res.result.status == 401) {
      AuthS.logout()
    }

    let data = res.result.content.get("surveys") as any[]
    if (!data) {
      return
    }

    let svs = data.map(val => {

      return {
        id: val["id"],
        title: val["title"],
        description: val["description"],
        owner_id: val["owner_id"],
        is_public: val["is_public"],
        created_at: val["created_at"],
      } as SurveyData
    })


    SetStore("dashboardSurveys", svs)
  }

}


let AppState = new State()




export default AppState




