import { SurveyData, SurveyS } from "~/services/surveyService";
import { HomeTabType, SetStore, Store, UserData } from "./store"
import { AuthS } from "~/services/services";
import { SurveyQuestion, SurveyQuestionError } from "~/types";
import { ZodSafeParseResult } from "zod";
import { unwrap } from "solid-js/store";

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
  #surveyQuestions: Record<string, SurveyQuestion[]> = {}
  #surveyQuestionsErrors: Record<string, SurveyQuestionError[]> = {}


  constructor() {
    // Load state from local storate

    this.#load()
  }

  #save() {
    localStorage.setItem(State.NAME, JSON.stringify({
      connected: this.connected,
      accessToken: this.accessToken,
      activeHomeTab: this.activeHomeTab,
      activeDashboardSurveyId: this.#activeDashboardSurveyId,
      surveyQuestions: JSON.stringify(this.#surveyQuestions),
      surveyQuestionsErrors: JSON.stringify(this.#surveyQuestionsErrors),
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
      this.#reconciliateSureyQuestions(jsonState["surveyQuestions"])
      SetStore("activeHomeTab", this.#activeHomeTab)
      SetStore("activeDashboardSurveyId", this.#activeDashboardSurveyId)

      const parsedQuestionsErrors: Record<string, SurveyQuestionError[]> = jsonState["surveyQuestionsErrors"] ? JSON.parse(jsonState["surveyQuestionsErrors"]) : {};
      console.log(jsonState["surveyQuestionsErrors"], parsedQuestionsErrors)
      SetStore("surveyQuestionsErrors", parsedQuestionsErrors)

    } catch (error) {
      console.log("Failed to load state")
      console.log(error, state)
    }
    this.#loaded = true
  }

  #reconciliateSureyQuestions(storedQuestions: string) {

    try {
      const parsedQuestions: Record<string, SurveyQuestion[]> = storedQuestions ? JSON.parse(storedQuestions) : {};
      this.#surveyQuestions = parsedQuestions
      SetStore("surveyQuestions", parsedQuestions)
    } catch (error) {

    }
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

  get surveyQuestions(): Record<string, SurveyQuestion[]> {
    if (!this.#loaded) {
      this.#load()
    }
    return this.#surveyQuestions
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

    let res = await SurveyS.getCreateSurveys()
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
        state: val["state"]
      } as SurveyData
    })

    SetStore("dashboardSurveys", svs)
  }

  async updatePublicSurveys() {

    let res = await SurveyS.getPublicSurveys()
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
        state: val["state"]
      } as SurveyData
    })

    SetStore("publcSurveys", svs)
  }


  removeSurveyQuestion(surveyId: string, questionId: string, updateStore = true) {
    if (updateStore) {

      SetStore("surveyQuestions", surveyId, (prev) =>
        prev.filter(q => q.id !== questionId)
      );

    }


    if (!this.#surveyQuestions[surveyId]) {
      this.#surveyQuestions[surveyId] = []
    }

    this.#surveyQuestions[surveyId] = this.#surveyQuestions[surveyId].filter(q => q.id !== questionId)
    this.removeAllQuestionError(surveyId, questionId)


    this.#save()
  }

  addSurveyQuestion(surveyId: string, question: SurveyQuestion, updateStore = true) {

    if (updateStore) {
      SetStore("surveyQuestions", surveyId, (prev = []) => [...prev, { ...question }]);
      console.log(unwrap(Store.surveyQuestions))
    }


    if (!this.#surveyQuestions[surveyId]) {
      this.#surveyQuestions[surveyId] = []
    }

    this.#surveyQuestions[surveyId].push(question)

    this.#save()
  };

  upsertSurveyQuestion(surveyId: string, questionId: string, question: SurveyQuestion, updateStore = true) {
    question.last_modified = new Date(Date.now())

    if (this.#surveyQuestions[surveyId] && this.#surveyQuestions[surveyId].find(v => v.id == questionId)) {

      this.#surveyQuestions[surveyId] = this.#surveyQuestions[surveyId].map(q => q.id === questionId ? { ...question } : q)
    }

    if (updateStore) {

      if (Store.surveyQuestions[surveyId] && !!Store.surveyQuestions[surveyId].find(v => v.id == questionId)) {

        SetStore("surveyQuestions", surveyId, (questions) =>
          questions.map(q => q.id === questionId ? { ...question } : q)
        );
      } else {
        this.addSurveyQuestion(surveyId, question)
      }
    }

    this.#save()
  }

  syncQuestionErrors() {
    for (const key in this.#surveyQuestions) {

      SetStore("surveyQuestions", key, this.#surveyQuestions[key])
    }
  }

  upsertQuestionError(surveyId: string, key: string, error: string) {

    let errs = this.#surveyQuestionsErrors[surveyId]
    if (!errs) {
      errs = []
    }

    this.#surveyQuestionsErrors[surveyId] = [...errs, { field: key, value: error }]

    this.#save()
  }

  removeAllQuestionError(surveyId: string, pattern: string) {

    let errs = this.#surveyQuestionsErrors[surveyId]
    if (!errs) {
      return
    }

    let reg = new RegExp(`${pattern}.*`)
    this.#surveyQuestionsErrors[surveyId] = errs.filter(v => !reg.test(v.field))
    SetStore("surveyQuestionsErrors", surveyId, (prev) => prev.filter(v => !reg.test(v.field)))

    this.#save()
  }

  removeQuestionError(surveyId: string, key: string) {

    let errs = this.#surveyQuestionsErrors[surveyId]
    if (!errs) {
      return
    }

    this.#surveyQuestionsErrors[surveyId] = errs.filter(v => v.field != key)

    this.#save()
  }

  setQuestions(surveyId: string, questions: SurveyQuestion[]) {
    this.#surveyQuestions[surveyId] = [...questions]
    SetStore("surveyQuestions", surveyId, (prev) => [...questions])
    SetStore("surveyQuestionsErrors", surveyId, (prev) => [])
  }

  handleQuestionError(err: ZodSafeParseResult<object>, key: string, surveyId: string) {

    AppState.removeQuestionError(surveyId, key)


    if (!Store.surveyQuestionsErrors[surveyId]) {
      SetStore("surveyQuestionsErrors", surveyId, [])
    }

    SetStore("surveyQuestionsErrors", surveyId, (prev = []) =>
      prev.filter(q => q.field !== key)
    )

    if (!err.error) {

      return
    }

    let msg = err.error.issues[0].message

    SetStore("surveyQuestionsErrors", surveyId, (prev = []) => {

      return [...prev, { field: key, value: msg }]
    })

    AppState.upsertQuestionError(surveyId, key, msg)
  }

}

let AppState = new State()

export default AppState




