import { BsLockFill } from "solid-icons/bs"
import { IoArrowBack } from "solid-icons/io"
import { Component, createEffect, createSignal, For, Switch, Match, Show } from "solid-js"
import { AuthS } from "~/services/services"
import { SurveyData, SurveyS } from "~/services/surveyService"
import AppState from "~/state/state"
import { Store } from "~/state/store"

const [surveys, setSurveys] = createSignal<SurveyData[]>()

const Dashboard: Component = () => {

  createEffect(async () => {
    let res = await SurveyS.getCreateSurveys(true)
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
      } as SurveyData
    })

    setSurveys(svs)
  })


  return (
    <div class="flex-1 p-[16px] flex flex-col gap-4">
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

const DashboardPanel: Component = () => {

  let activeSurvey = () => surveys()?.find(v => v.id == Store.activeDashboardSurveyId)

  return (
    <div class="h-12 bg-transparent border-b-1 border-base-100 flex">
      <Switch>
        <Match when={Store.activeDashboardSurveyId == ""}>
          <div>
          </div>
        </Match>
        <Match when={Store.activeDashboardSurveyId != ""}>
          <div class="flex gap-4 items-center select-none">
            <button class="btn btn-outline border-0 hover:text-primary"
              onclick={() => AppState.activeDashboardSurveyId = ""}
            >
              <IoArrowBack />
            </button>
            <span class="text-content text-sm font-medium"> {activeSurvey()?.title} </span>
          </div>
        </Match>
      </Switch>
    </div>
  )
}


const SurveyStats = () => {
  return (

    <div class="flex-1 flex bg-transparent flex flex-col gap-2 ">
      <span>Stats</span>
    </div>

  )

}


const DashboardBody = () => {
  return (

    <div class="flex-1 flex bg-transparent flex flex-col gap-2 ">
      <For each={surveys()}>
        {(item, index) =>
          <SurveyCard data={item} />
        }
      </For>
    </div>

  )

}

const DashboardFooter: Component = () => {

  return (
    <div class="h-12 bg-transparent flex items-center justify-end">
      <Switch>
        <Match when={!Store.activeDashboardSurveyId}>
          <button class="btn btn-primary rounded-[.5rem]">
            <span class="text-content text-sm font-medium">
              Create survey
            </span>
          </button>
        </Match>

        <Match when={!!Store.activeDashboardSurveyId}>
          <button class="btn btn-error rounded-[.5rem]">
            <span class="text-content text-sm font-medium">
              Delete survey
            </span>
          </button>
        </Match>
      </Switch>

    </div>
  )
}


interface SurveysCardProps {
  data: SurveyData
}


const SurveyCard = (props: SurveysCardProps) => {

  return (
    <div class="relative h-24 border-base-100 p-1 border-b-1 rounded-[0.25rem] select-none flex flex-col cursor-pointer hover:bg-base-100 overflow-hidden"
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
