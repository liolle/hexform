import { BsLockFill } from "solid-icons/bs"
import { IoArrowBack } from "solid-icons/io"
import { Component, createEffect, createSignal, For, Switch, Match, Show } from "solid-js"
import { AuthS } from "~/services/services"
import { SurveyData, SurveyS, SurveyState } from "~/services/surveyService"
import AppState from "~/state/state"
import { Store } from "~/state/store"
import CreateSurveyDialog from "./createSurveyDialog"
import DeleteSurveyDialog from "./deleteSurveyDialog"
import SurveyEditor from "./surveyEditor"
import CreateQuestionDialog from "./CreateQuestionDialog"
import DashboardFooter from "./dashboardFooter"
import DashboardPanel from "./dashboardPanel"


const Dashboard: Component = () => {

  createEffect(async () => {
    AppState.updateDashboardSurveys()
  })

  return (
    <div class="flex-1 p-[16px] flex flex-col gap-4">

      <CreateSurveyDialog />
      <DeleteSurveyDialog />
      <CreateQuestionDialog />
      <DashboardPanel />

      <Switch>
        <Match when={Store.activeDashboardSurveyId == ""}>
          <DashboardBody />
        </Match>
        <Match when={Store.activeDashboardSurveyId != ""}>
          <SurveyStats />
        </Match>
      </Switch>

      <DashboardFooter />
    </div>
  )
}

const SurveyStats = () => {

  let activeSurvey = () => Store.dashboardSurveys?.find(v => v.id == Store.activeDashboardSurveyId)
  return (
    <div class="flex-1 flex bg-transparent flex flex-col gap-2 ">
      <Switch>
        <Match when={!!activeSurvey() && activeSurvey()?.state == SurveyState.CREATED}>
          <SurveyEditor survey={activeSurvey()} />
        </Match>
        <Match when={!!activeSurvey() && activeSurvey()?.state == SurveyState.DONE || activeSurvey()?.state == SurveyState.PUBLISHED}>
          <span>Stats</span>
        </Match>
      </Switch>
    </div>
  )
}

const DashboardBody = () => {
  return (
    <div class="flex-1 flex bg-transparent flex flex-col gap-2 overflow-y-scroll  ">
      <div class="h-fit min-h-screen  flex-[3_1_0]">
        <For each={Store.dashboardSurveys}>

          {(item, index) =>
            <SurveyCard data={item} />
          }
        </For>
      </div>
    </div>
  )
}



interface SurveysCardProps {
  data: SurveyData
}

const SurveyCard = (props: SurveysCardProps) => {

  return (
    <div class=" relative h-24 border-base-100 p-1 border-b-1 rounded-[0.25rem] select-none flex flex-col cursor-pointer hover:bg-base-100"
      onclick={() => AppState.activeDashboardSurveyId = props.data.id}
    >
      <div class="absolute top-1 right-1 w-6 h-6 rounded-[0.25rem] bg-transparent">
        <Show when={!props.data.is_public}>
          <BsLockFill />
        </Show>
      </div>
      <div class="max-w-[400px]">
        <span class="text-content text-sm font-medium"> {props.data.title} </span>
      </div>
      <div class="max-w-[400px] wrap-anywhere leading-none">
        <span class=" text-content text-xs opacity-60"> {props.data.description} </span>
      </div>
    </div>
  )
}

export default Dashboard
