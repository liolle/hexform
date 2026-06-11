import { AiOutlinePlus } from "solid-icons/ai"
import { IoArrowBack } from "solid-icons/io"
import { Component, Match, Switch } from "solid-js"
import AppState from "~/state/state"
import { Store } from "~/state/store"

let activeSurvey = () => Store.dashboardSurveys?.find(v => v.id == Store.activeDashboardSurveyId)
const DashboardPanel: Component = () => {

  const openSurveyQuestionModal = () => {
    let dialog = document.getElementById('create_survey_question_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.showModal()
  }

  const publishSurvey = () => {

  }

  const previewSurvey = () => {

  }

  return (
    <div class="h-12 bg-transparent border-b-1 border-base-100 flex justify-between items-center">
      <Switch>
        <Match when={Store.activeDashboardSurveyId == ""}>
          <div>
          </div>
        </Match>
        <Match when={Store.activeDashboardSurveyId != ""}>
          <div class="flex  gap-4 items-center select-none">
            <button class="btn btn-outline border-0 hover:text-primary"
              onclick={() => AppState.activeDashboardSurveyId = ""}
            >
              <IoArrowBack />
            </button>
            <span class="text-content text-sm font-medium"> {activeSurvey()?.title} </span>
          </div>
          <div class="flex gap-4 items-center">

            <button class="btn btn-soft btn-secondary rounded-[.5rem]" onclick={previewSurvey}>
              <span class="text-content text-sm font-medium">
                Preview
              </span>
            </button>

            <button class="btn btn-soft btn-primary rounded-[.5rem]" onclick={publishSurvey}>
              <span class="text-content text-sm font-medium">
                Publish
              </span>
            </button>

            <button class="btn btn-dash btn-info p-0 w-8 h-8" onclick={openSurveyQuestionModal}>
              <AiOutlinePlus />
            </button>
          </div>

        </Match>
      </Switch>
    </div>
  )
}

export default DashboardPanel
