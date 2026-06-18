import { useNavigate } from "@solidjs/router"
import { AiOutlinePlus } from "solid-icons/ai"
import { IoArrowBack } from "solid-icons/io"
import { Component, Match, Show, Switch } from "solid-js"
import { SurveyS } from "~/services/surveyService"
import AppState from "~/state/state"
import { SetStore, Store } from "~/state/store"
import { SurveyData, SurveyState } from "~/types"


const DashboardPanel: Component = () => {
  const navigate = useNavigate()
  let activeSurvey = () => Store.dashboardSurveys?.find(v => v.id == Store.activeDashboardSurveyId)
  let publishing = false


  const openSurveyQuestionModal = () => {
    let dialog = document.getElementById('create_survey_question_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.showModal()
  }

  const publishSurvey = async () => {
    if (publishing) {
      return
    }
    let surveyId = Store.activeDashboardSurveyId
    if (!surveyId) {
      return
    }
    publishing = true

    let response = await SurveyS.publishSurvey(surveyId)

    if (response.result.status >= 300) {

      publishing = false
      return
    }

    let data: SurveyData = response.result.content["survey"]
    await SurveyS.invalidateSurvey(surveyId)

    if (!data) {
      publishing = false
      return
    }

    AppState.updateDashboarSurveyFromSingle(
      data
    )


    publishing = false
  }

  const previewSurvey = () => {
    let surveyId = Store.activeDashboardSurveyId
    if (!surveyId) {
      return
    }

    SurveyS.invalidateSurvey(surveyId)
    SetStore("surveyAnswersErrors", surveyId, () => [])
    SetStore("surveyAnswers", surveyId, () => [])
    navigate(`/preview/${surveyId}`)

  }

  return (
    <div class="h-16 py-2 bg-transparent border-b-1 border-base-100 flex justify-between items-center">
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
          <Show when={activeSurvey()?.state == SurveyState.CREATED} >
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
          </Show>

        </Match>
      </Switch>
    </div>
  )
}

export default DashboardPanel
