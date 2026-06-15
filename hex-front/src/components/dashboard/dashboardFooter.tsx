import { Component, Match, Switch } from "solid-js"
import { SurveyS } from "~/services/surveyService"
import DB, { DBStoreNames } from "~/state/database"
import AppState from "~/state/state"
import { Store } from "~/state/store"
import { CachedQuestions, SurveyQuestion } from "~/types"


const tempQid = new RegExp("TEMP-.*")
let sending = false

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

    let local_questions = await DB.getFromKey(DBStoreNames.LOCAL_QUESTIONS, surveyId) as CachedQuestions
    let questions = local_questions.questions

    if (!questions) {
      sending = false
      return
    }

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

      AppState.connected = false
      AppState.accessToken = ""

      sending = false
      return
    }

    let data: CachedQuestions = {
      survey_id: surveyId,
      questions: res.result.content["questions"]
    }

    await DB.updateStore(DBStoreNames.LOCAL_QUESTIONS, data)

    sending = false
  }


  return (
    <div class="h-12 bg-transparent flex items-center ">
      <Switch>
        <Match when={!Store.activeDashboardSurveyId}>
          <button class="btn btn-primary rounded-[.5rem]"
            onclick={openCreateSurveyModal}>
            <span class="text-content text-sm font-medium">
              Create survey
            </span>
          </button>
        </Match>

        <Match when={!!Store.activeDashboardSurveyId}>
          <div class="flex flex-1 justify-between">
            <button class="btn btn-soft btn-info rounded-[.5rem]"
              disabled={(() => {
                const surveyErrors = Store.surveyQuestionsErrors?.[Store.activeDashboardSurveyId]
                if (!surveyErrors) return false

                // Check if any question has any non-empty error message
                return Object.values(surveyErrors).some(questionErrors =>
                  Object.values(questionErrors).some(error => error && error.trim() !== "")
                )
              })()}
              onclick={SaveSurvey}>
              <span class="text-content text-sm font-medium">
                Save
              </span>
            </button>
            <button class="btn btn-soft btn-error rounded-[.5rem]" onclick={openDeleteSurveyModal}>
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
