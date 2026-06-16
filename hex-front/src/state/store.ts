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
  connected: boolean
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

export const [Store, SetStore] = createStore<StoreType>({
  accessToken: "",
  connected: false,
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
})


