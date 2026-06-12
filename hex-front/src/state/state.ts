import { SurveyS } from "~/services/surveyService";
import { HomeTabType, SetStore, Store, UserData } from "./store"
import { AuthS } from "~/services/services";
import { CachedQuestions, SurveyData, SurveyQuestion, SurveyQuestionError } from "~/types";
import { ZodSafeParseResult } from "zod";
import DB, { DBStoreNames } from "./database";

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
  #surveyQuestionsErrors: Record<string, SurveyQuestionError[]> = {}


  constructor() {
    this.#load()
  }

  #save() {
    localStorage.setItem(State.NAME, JSON.stringify({
      connected: this.connected,
      accessToken: this.accessToken,
      activeHomeTab: this.activeHomeTab,
      activeDashboardSurveyId: this.#activeDashboardSurveyId,
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
      SetStore("activeHomeTab", this.#activeHomeTab)
      SetStore("activeDashboardSurveyId", this.#activeDashboardSurveyId)

      const parsedQuestionsErrors: Record<string, SurveyQuestionError[]> = jsonState["surveyQuestionsErrors"] ? JSON.parse(jsonState["surveyQuestionsErrors"]) : {};
      SetStore("surveyQuestionsErrors", parsedQuestionsErrors)

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

    let res = await SurveyS.getCreateSurveys()
    if (res.result.status == 401) {
      AuthS.logout()
    }

    let data = res.result.content["surveys"] as any[]
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

    let data = res.result.content["surveys"] as any[]
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


  async removeSurveyQuestion(surveyId: string, questionId: string, updateStore = true) {

    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []
    let question = questions.find(v => v.id == questionId)

    let now = new Date(Date.now())

    if (!!question) {
      for (let i = question.position + 1; i < questions.length; i++) {
        questions[i].position--
        questions[i].last_modified = now
      }
    }

    let filtered = questions.filter(q => q.id !== questionId)



    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: filtered
    }


    await DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)


    if (updateStore) {

      SetStore("surveyQuestions", surveyId, (prev) =>
        filtered
      );
    }

    this.removeAllQuestionError(surveyId, questionId)
  }

  async addSurveyQuestion(surveyId: string, question: SurveyQuestion, updateStore = true) {

    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []

    let position = 0

    if (questions.length > 0) {
      position = questions[questions.length - 1].position + 1
    }

    question.position = position


    questions.push(question)

    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: questions
    }

    await DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)

    if (updateStore) {
      SetStore("surveyQuestions", surveyId, (prev = []) => questions);
    }
  };

  async #swapQuestionIndex(surveyId: string, questions: SurveyQuestion[], idx1: number, idx2: number) {
    let temp = questions[idx1].position
    questions[idx1].position = questions[idx2].position
    questions[idx2].position = temp

    let qTemp = questions[idx1]
    questions[idx1] = questions[idx2]
    questions[idx2] = qTemp


    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: questions
    }

    await DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)
    SetStore("surveyQuestions", surveyId, (prev) =>
      questions
    );

  }

  async pushUpQuestion(surveyId: string, q_id: string) {
    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []

    let idx = -1

    for (let i = 0; i < questions.length; i++) {
      const element = questions[i];
      if (element.id == q_id) {
        idx = i
      }
    }

    if (idx < 1) {
      return
    }

    let q1_idx = idx
    let q2_idx = idx - 1

    await this.#swapQuestionIndex(surveyId, questions, q1_idx, q2_idx)
  }

  async pushDownQuestion(surveyId: string, q_id: string) {
    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []

    let idx = -1

    for (let i = 0; i < questions.length; i++) {
      const element = questions[i];
      if (element.id == q_id) {
        idx = i
      }
    }

    if (idx >= questions.length - 1) {
      return
    }

    let q1_idx = idx
    let q2_idx = idx + 1

    await this.#swapQuestionIndex(surveyId, questions, q1_idx, q2_idx)
  }

  async swapQuestionPosition(surveyId: string, q1_id: string, q2_id: string) {

    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []

    let q1_idx = -1
    let q2_idx = -1

    for (let i = 0; i < questions.length; i++) {
      const element = questions[i];
      if (element.id == q1_id) {
        q1_idx = i
      }

      if (element.id == q2_id) {
        q2_idx = i
      }
    }

    if (q1_idx < 0 || q2_idx < 0 || q1_idx == q2_idx) {
      return
    }

    await this.#swapQuestionIndex(surveyId, questions, q1_idx, q2_idx)
  }

  async upsertSurveyQuestion(surveyId: string, questionId: string, question: SurveyQuestion, updateStore = true) {

    question.last_modified = new Date(Date.now())

    let qInfo = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = qInfo.questions ?? []
    let filtered = questions.map(q => q.id === questionId ? { ...question } : q)

    if (filtered.length == 0) {
      filtered.push(question)
    }


    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: filtered
    }

    await DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)

    if (updateStore) {
      SetStore("surveyQuestions", surveyId, (questions) =>
        filtered
      );
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
