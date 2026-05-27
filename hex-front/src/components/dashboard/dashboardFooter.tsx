import { Component, Match, Switch } from "solid-js"
import { unwrap } from "solid-js/store"
import { Store } from "~/state/store"

const DashboardFooter: Component = () => {

  const openCreateSurveyModal = () => {
    let dialog = document.getElementById('create_survey_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.showModal()
  }

  const openDeleteSurveyModal = () => {
    let dialog = document.getElementById('delete_survey_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.showModal()
  }

  const publishSurvey = () => {

    console.log(unwrap(Store.surveyQuestions[Store.activeDashboardSurveyId]))
  }

  return (
    <div class="h-12 bg-transparent flex items-center ">
      <Switch>
        <Match when={!Store.activeDashboardSurveyId}>
          <button class="btn btn-primary rounded-[.5rem]"
            onclick={openCreateSurveyModal}
          >
            <span class="text-content text-sm font-medium">
              Create survey
            </span>
          </button>
        </Match>

        <Match when={!!Store.activeDashboardSurveyId}>
          <div class="flex flex-1 justify-between">
            <button class="btn btn-info rounded-[.5rem]" onclick={publishSurvey}>
              <span class="text-content text-sm font-medium">
                Publish survey
              </span>
            </button>
            <button class="btn btn-error rounded-[.5rem]" onclick={openDeleteSurveyModal}>
              <span class="text-content text-sm font-medium">
                Delete survey
              </span>
            </button>
          </div>
        </Match>
      </Switch>
    </div>
  )
}

export default DashboardFooter
