import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { createResource } from "solid-js";
import { createStore } from "solid-js/store";
import { SurveyAnswer, SurveyData, SurveyQuestion, SurveyQuestionError } from "~/types";

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
    surveyAnswers: {}
  }),
  {
    name: "hexform-store",
    storage: localforage,
  }
)

export const [storeReady] = createResource(() => init);

