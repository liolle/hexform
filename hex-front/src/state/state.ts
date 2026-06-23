import { SurveyS } from "~/services/surveyService";
import { HomeTabType, SetStore, Store, UserData } from "./store"
import { AuthS } from "~/services/services";
import { CachedQuestions, NumberConfig, SurveyAnswer, SurveyAnswers, SurveyData, SurveyDataExtened, SurveyQuestion, SurveyQuestionType } from "~/types";
import z, { ZodSafeParseResult } from "zod";
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

  constructor() { }


  // Getter
  get accessToken(): string | undefined {
    return Store.accessToken
  }

  get activeDashboardSurveyId(): string {
    return Store.activeDashboardSurveyId
  }


  get connected(): boolean {
    return Store.user != undefined
  }

  get activeHomeTab(): HomeTabType {
    return Store.activeHomeTab
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
          SetStore("accessToken", token)
        }

      } catch (error) {
        SetStore("user", undefined)
        SetStore("accessToken", "")
      }

    } else {
      SetStore("user", undefined)
      SetStore("accessToken", "")
    }
  }

  // Setter
  set accessToken(token: string | undefined) {
    this.#setClaims(token)
  }

  set activeHomeTab(tab: HomeTabType) {
    SetStore("activeHomeTab", tab)
  }

  set activeSurveyId(id: string) {
    SetStore("activeSurveyId", id)
  }

  set activeDashboardSurveyId(id: string) {
    SetStore("activeDashboardSurveyId", id)
  }

  updateDashboarSurveyFromSingle(survey: SurveyData) {
    SetStore("dashboardSurveys", (prev) => prev.map(v => v.id == survey.id ? survey : v))
  }


  async updateDashboardSurveys() {

    let res = await SurveyS.getCreateSurveys()
    if (res.result.status == 401) {
      await AuthS.logout()
      return
    }

    let data = res.result.content["surveys"] as SurveyDataExtened[]
    if (!data) {
      return
    }

    let svs = data.map(val => {

      return {
        id: val.survey["id"],
        title: val.survey["title"],
        description: val.survey["description"],
        owner_id: val.survey["owner_id"],
        is_public: val.survey["is_public"],
        created_at: val.survey["created_at"],
        state: val.survey["state"],
        submited: val.submited
      } as SurveyData
    })

    SetStore("dashboardSurveys", (prev) => svs)
  }

  async updatePublicSurveys() {

    let res = await SurveyS.getPublicSurveys()
    if (res.result.status == 401) {
      await AuthS.logout()
      return
    }

    let data = res.result.content["surveys"] as SurveyDataExtened[]
    if (!data) {
      return
    }

    let svs = data.map(val => {

      return {
        id: val.survey["id"],
        title: val.survey["title"],
        description: val.survey["description"],
        owner_id: val.survey["owner_id"],
        is_public: val.survey["is_public"],
        created_at: val.survey["created_at"],
        state: val.survey["state"],
        submited: val.submited
      } as SurveyData
    })

    SetStore("publcSurveys", svs)
  }


  async removeSurveyQuestion(surveyId: string, questionId: string, updateStore = true) {

    let qInfo = unwrap(Store.surveyQuestions[surveyId])
    let questions = qInfo ?? []
    let questionIdx = questions.findIndex(v => v.id == questionId)

    let now = new Date(Date.now())

    if (questionIdx < 0) {
      for (let i = questionIdx; i < questions.length; i++) {
        questions[i].position--
        questions[i].last_modified = now
      }
    }

    let updated = questions.filter(q => q.id !== questionId)

    SetStore("surveyQuestions", surveyId, (prev) => updated)
    this.removeQuestionError(surveyId, questionId)
  }

  async addSurveyQuestion(surveyId: string, question: SurveyQuestion, updateStore = true) {


    let qInfo = unwrap(unwrap(Store.surveyQuestions[surveyId]))
    let questions = qInfo ?? []

    let position = 0

    if (questions.length > 0) {
      position = questions[questions.length - 1].position + 1
    }

    question.position = position

    questions.push(question)

    SetStore("surveyQuestions", surveyId, (prev) => [...questions]);
  };

  async #swapQuestionIndex(surveyId: string, questions: SurveyQuestion[], idx1: number, idx2: number) {
    let temp = questions[idx1].position
    questions[idx1].position = questions[idx2].position
    questions[idx2].position = temp

    let qTemp = questions[idx1]
    questions[idx1] = questions[idx2]
    questions[idx2] = qTemp

    SetStore("surveyQuestions", surveyId, (prev) =>
      [...questions]
    );

  }

  async pushUpQuestion(surveyId: string, q_id: string) {

    let qInfo = unwrap(Store.surveyQuestions[surveyId])
    let questions = qInfo ?? []

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

    let qInfo = unwrap(Store.surveyQuestions[surveyId])
    let questions = qInfo ?? []

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

    let qInfo = unwrap(Store.surveyQuestions[surveyId])
    let questions = qInfo ?? []

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

    question.last_modified = new Date(Date.now());

    const existingQuestions = unwrap(Store.surveyQuestions[surveyId]) ?? [];
    const questionIndex = existingQuestions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      SetStore("surveyQuestions", surveyId, (questions) => [
        ...(questions || []),
        question
      ]);
    } else {
      SetStore("surveyQuestions", surveyId, questionIndex, question);
    }
  }

  /* Survey submission*/

  async upsertSurveyAnswersPosition(surveyId: string, position: number) {
    let info = Store.surveyAnswers[surveyId]

    if (!info) {
      return
    }

  }

  async upsertSurveyAnswers(surveyId: string, questionId: string, answer: SurveyAnswer, updateStore = true) {
    let answers = Store.surveyAnswers[surveyId] ?? []

    let included = false

    let updated = answers.map(ans => {
      if (ans.questionId === questionId) {
        included = true

      }
      return ans.questionId === questionId ? { ...answer } : ans
    })

    if (!included) {
      updated.push(answer)
    }

    SetStore("surveyAnswers", surveyId, (questions) =>
      updated
    );

  }

  upsertQuestionError(surveyId: string, key: string, error: string) {

    let err = unwrap(Store.surveyQuestionsErrors[surveyId])
    let included = false

    let updated = err.map(ans => {
      if (ans.key === key) {
        included = true

      }
      return ans.key === key ? { ...ans, value: error } : ans
    })

    if (!included) {
      updated.push({
        key: key,
        value: error
      })
    }


    SetStore("surveyQuestionsErrors", surveyId, (prev) =>
      updated
    )

  }

  upsertAnswerError(surveyId: string, key: string, error: string) {

    let err = unwrap(Store.surveyAnswersErrors[surveyId])
    let included = false

    let updated = err.map(ans => {
      if (ans.key === key) {
        included = true

      }
      return ans.key === key ? { ...ans, value: error } : ans
    })

    if (!included) {
      updated.push({
        key: key,
        value: error
      })
    }

    SetStore("surveyAnswersErrors", surveyId, (prev) =>
      updated
    )
  }

  removeQuestionError(surveyId: string, pattern: string) {
    let reg = new RegExp(`${pattern}.*`)
    if (!Store.surveyAnswersErrors[surveyId]) {
      SetStore("surveyQuestionsErrors", surveyId, [])
    }
    SetStore("surveyQuestionsErrors", surveyId, (prev) => prev?.filter(v => !reg.test(v.key)))

  }

  removeAnswerError(surveyId: string, pattern: string) {
    let reg = new RegExp(`${pattern}.*`)
    if (!Store.surveyAnswersErrors[surveyId]) {
      SetStore("surveyAnswersErrors", surveyId, [])
    }
    SetStore("surveyAnswersErrors", surveyId, (prev) => prev?.filter(v => !reg.test(v.key)))
  }

  handleAnswerError(surveyId: string, answer: SurveyQuestion) {
    let key = `${answer.id}:value`

    if (!Store.surveyAnswers[surveyId]) {
      SetStore("surveyAnswers", surveyId, [])
    }

    let content = Store.surveyAnswers[surveyId].find(v => v.questionId == answer.id)?.response ?? ""


    switch (answer.type) {
      case SurveyQuestionType.BOOL:

        AppState.removeAnswerError(surveyId, key)
        if (content == "") {
          AppState.upsertAnswerError(surveyId, key, "Make sure to pick an answer")
        }
        break;

      case SurveyQuestionType.MULTI_PICK:
        break;

      case SurveyQuestionType.NUMBER:
        let config: NumberConfig = { min: 0, max: 100, mean: 0 }
        try {
          config = JSON.parse(answer.config) as NumberConfig
        } catch (error) { }

        const Schema = z.object({
          value: z.number()
            .min(config.min, `The value must be between ${config.min} and ${config.max}`)
            .max(config.max, `The value must be between ${config.min} and ${config.max}`),
        })

        let value = parseInt(content ?? "")

        if (Number.isNaN(value)) {
          value = config.min - 1
        }

        let err = Schema.safeParse({ value: value })
        AppState.handleAnswersError(err, key, surveyId)
        break;

      case SurveyQuestionType.RATING:
        let ratingConfig: NumberConfig = { min: 0, max: 100, mean: 0 }
        try {
          ratingConfig = JSON.parse(answer.config) as NumberConfig
        } catch (error) { }

        const ratingSchema = z.object({
          value: z.number()
            .min(1, `The value must be between 1 and ${ratingConfig.max}`)
            .max(ratingConfig.max, `The value must be between 1 and ${ratingConfig.max}`),
        })

        let ratingValue = parseInt(content ?? "")

        if (Number.isNaN(ratingValue)) {
          ratingValue = 0
        }

        let ratingErr = ratingSchema.safeParse({ value: ratingValue })
        AppState.handleAnswersError(ratingErr, key, surveyId)
        break;

      case SurveyQuestionType.TEXT:

        const textSchema = z.object({
          value: z.string()
            .min(1, "The answer needs to be at least 1 character long")
        })

        let textErr = textSchema.safeParse({ value: content })

        AppState.handleAnswersError(textErr, key, surveyId)
        break;
    }
  }


  handleAnswersError(err: ZodSafeParseResult<object>, key: string, surveyId: string) {
    AppState.removeAnswerError(surveyId, key)

    if (!Store.surveyAnswersErrors[surveyId]) {
      SetStore("surveyAnswersErrors", surveyId, [])
    }

    SetStore("surveyAnswersErrors", surveyId, (prev = []) =>
      prev.filter(q => q.key !== key)
    )

    if (!err.error) {
      return
    }

    let msg = err.error.issues[0].message

    SetStore("surveyAnswersErrors", surveyId, (prev = []) => {

      return [...prev, { key: key, value: msg }]
    })

    AppState.upsertAnswerError(surveyId, key, msg)
  }

  handleQuestionError(err: ZodSafeParseResult<object>, key: string, surveyId: string) {
    AppState.removeQuestionError(surveyId, key)

    if (!Store.surveyQuestionsErrors[surveyId]) {
      SetStore("surveyQuestionsErrors", surveyId, [])
    }

    SetStore("surveyQuestionsErrors", surveyId, (prev = []) =>
      prev.filter(q => q.key !== key)
    )

    if (!err.error) {

      return
    }

    let msg = err.error.issues[0].message

    SetStore("surveyQuestionsErrors", surveyId, (prev = []) => {

      return [...prev, { key: key, value: msg }]
    })

    AppState.upsertQuestionError(surveyId, key, msg)
  }


}

let AppState = new State()

export default AppState
