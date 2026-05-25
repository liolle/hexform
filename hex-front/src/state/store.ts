import { createStore } from "solid-js/store";
import { SurveyData } from "~/services/surveyService";

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
}

export const [Store, SetStore] = createStore<StoreType>({
  user: undefined,
  activeHomeTab: HomeTabType.DASHBOARD,
  activeDashboardSurveyId: "",
  dashboardSurveys: []
})


