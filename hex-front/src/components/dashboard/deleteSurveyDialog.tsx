import { Component, createEffect, createSignal, onCleanup } from "solid-js"
import toast, { Toaster } from "solid-toast"
import { AuthS } from "~/services/services"
import { SurveyS } from "~/services/surveyService"
import ToastS from "~/services/toastService"
import AppState from "~/state/state"
import { SetStore, Store } from "~/state/store"



const DeleteSurveyDialog: Component = () => {

  let sending = false

  const closeSurveyModal = () => {
    let dialog = document.getElementById('delete_survey_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.close()
  }

  const handleSubmit = async (del: boolean) => {




    try {

      if (sending || !del) {
        return
      }

      sending = true

      let response = await SurveyS.deleteSurvey(AppState.activeDashboardSurveyId)
      let survey = Store.dashboardSurveys.find(v => v.id == AppState.activeDashboardSurveyId)
      if (response.result.status == 401) {

        AuthS.logout()
        return
      }

      SetStore("dashboardSurveys", (arr) => {
        return arr.filter(v => v.id != AppState.activeDashboardSurveyId)
      })

      AppState.activeDashboardSurveyId = ""


    } catch (error) {

    }
    finally {

      sending = false
      closeSurveyModal()

    }
  }


  return (
    <dialog id="delete_survey_modal" class="modal modal-bottom sm:modal-middle ">
      <div class="modal-box relative h-[150px] flex flex-col justify-between">
        <div>
          <span class="text-md">Are you sure </span>
        </div>

        <div class="flex gap-4">
          <button class="btn btn-soft btn-error rounded-[.5rem]" onclick={() => handleSubmit(true)}>
            Yes
          </button>

          <button class="btn btn-soft btn-accent rounded-[.5rem]" onclick={() => handleSubmit(false)}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default DeleteSurveyDialog

