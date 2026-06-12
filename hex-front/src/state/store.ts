import { createStore } from "solid-js/store";
import { SurveyData } from "~/services/surveyService";
import { SurveyQuestion, SurveyQuestionError } from "~/types";

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
  user: UserData | undefined
  activeHomeTab: HomeTabType
  activeDashboardSurveyId: string
  dashboardSurveys: SurveyData[]
  publcSurveys: SurveyData[]
  surveyQuestions: Record<string, SurveyQuestion[]>
  surveyQuestionsErrors: Record<string, SurveyQuestionError[]>
}

export const [Store, SetStore] = createStore<StoreType>({
  user: undefined,
  activeHomeTab: HomeTabType.DASHBOARD,
  activeDashboardSurveyId: "",
  dashboardSurveys: [],
  publcSurveys: [],
  surveyQuestions: {},
  surveyQuestionsErrors: {}
})


