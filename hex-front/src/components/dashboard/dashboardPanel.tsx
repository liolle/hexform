import { useNavigate } from "@solidjs/router"
import { AiOutlinePlus } from "solid-icons/ai"
import { IoArrowBack } from "solid-icons/io"
import { Component, Match, Show, Switch } from "solid-js"
import { SurveyS } from "~/services/surveyService"
import AppState from "~/state/state"
import { SetStore, Store } from "~/state/store"
import { SurveyData, SurveyState } from "~/types"


const tempQid = new RegExp("TEMP-.*")

const DashboardPanel: Component = () => {
  const navigate = useNavigate()
  let activeSurvey = () => Store.dashboardSurveys?.find(v => v.id == Store.activeDashboardSurveyId)
  let publishing = false
  let sending = false


  const openSurveyQuestionModal = () => {
    let dialog = document.getElementById('create_survey_question_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.showModal()
  }

  const SaveSurvey = async () => {
    if (sending) {
      return
    }
    sending = true
    let surveyId = Store.activeDashboardSurveyId
    if (surveyId == "") {
      sending = false
      return
    }

    let questions = Store.surveyQuestions[surveyId] ?? []



    let qs = questions.map(v => {
      return {
        title: v.title,
        id: tempQid.test(v.id) ? "" : v.id,
        type: v.type,
        config: v.config,
        last_modified: v.last_modified,
        position: v.position
      }
    })

    let res = await SurveyS.updateSurveyQuestion({
      questions: qs
    }, surveyId)

    if (res.result.status == 401) {

      AppState.accessToken = ""

      sending = false
      return
    }


    SetStore("surveyQuestions", surveyId, () => res.result.content["questions"])
    SurveyS.invalidateSurvey(surveyId)

    sending = false
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


    await SaveSurvey()

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
