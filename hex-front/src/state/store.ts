import { createStore } from "solid-js/store";

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
}

export const [Store, SetStore] = createStore<StoreType>({
  user: undefined,
  activeHomeTab: HomeTabType.DASHBOARD,
  activeDashboardSurveyId: ""
})


