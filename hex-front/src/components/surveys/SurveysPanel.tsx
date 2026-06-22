import { useNavigate } from "@solidjs/router"
import { IoArrowBack } from "solid-icons/io"
import { Component, Match, Switch } from "solid-js"
import AppState from "~/state/state"
import { Store } from "~/state/store"


const SurveysPanel: Component = () => {
  const navigate = useNavigate()
  let activeSurvey = () => Store.dashboardSurveys?.find(v => v.id == Store.activeDashboardSurveyId)

  return (
    <div class="h-16 py-2 bg-transparent border-b-1 border-base-100 flex justify-between items-center">
      <Switch>
        <Match when={Store.activeSurveyId == ""}>
          <div>
          </div>
        </Match>
        <Match when={Store.activeSurveyId != ""}>
          <div class="flex  gap-4 items-center select-none">
            <button class="btn btn-outline border-0 hover:text-primary"
              onclick={() => AppState.activeSurveyId = ""}
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

export default SurveysPanel
