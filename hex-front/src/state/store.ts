import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { createResource } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { SurveyAnswer, SurveyData, SurveyQuestion, SurveyQuestionError } from "~/types";
import { CachedClientResponse, CachedRequest } from "./httpClient";

export interface UserData {
  nickname: string
  email: string
  id: string
}

export enum HomeTabType {
  DASHBOARD = "DASHBOARD",
  SURVEYS = "SURVEYS"
}

export interface StoreType {
  accessToken: string
  user: UserData | undefined
  activeHomeTab: HomeTabType
  activeDashboardSurveyId: string
  activeSurveyId: string
  dashboardSurveys: SurveyData[]
  publcSurveys: SurveyData[]
  surveyQuestions: Record<string, SurveyQuestion[]>
  surveyQuestionsErrors: Record<string, SurveyQuestionError[]>
  surveyAnswersErrors: Record<string, SurveyQuestionError[]>
  surveyAnswers: Record<string, SurveyAnswer[]>
  apiCache: Record<string, CachedRequest>
}



export const [Store, SetStore, init] = makePersisted(
  createStore<StoreType>({
    accessToken: "",
    user: undefined,
    activeHomeTab: HomeTabType.DASHBOARD,
    activeDashboardSurveyId: "",
    activeSurveyId: "",
    dashboardSurveys: [],
    publcSurveys: [],
    surveyQuestions: {},
    surveyQuestionsErrors: {},
    surveyAnswersErrors: {},
    surveyAnswers: {},
    apiCache: {}
  }),
  {
    name: "hexform-store",
    storage: localforage,
  }
)


export const [storeReady] = createResource(async () => {
  await init
  return unwrap(Store)
});

