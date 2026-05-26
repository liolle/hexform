import { Component } from "solid-js"
import AppState from "~/state/state"
import { Store } from "~/state/store"
import { SurveyQuestion, SurveyQuestionType } from "~/types"

const chars = "abcdefghijklmnopkrstuvwxyz0123456789"

function generateTempId(): string {
  let id: string[] = []

  for (const c of "TEMP-") {
    id.push(c)
  }

  for (let i = 0; i < 15; i++) {
    let idx = Math.round(Math.random() * chars.length - 1)
    id.push(chars[idx])
  }

  return id.join("")
}

const CreateQuestionDialog: Component = () => {

  let formRef: HTMLFormElement | undefined

  const closeSurveyModal = () => {

    let dialog = document.getElementById('create_survey_question_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.close()
  }

  const pickQuestionType = (type: SurveyQuestionType) => {
    if (!Store.activeDashboardSurveyId) {
      return
    }

    let q: SurveyQuestion = {
      type: type,
      title: "",
      config: "",
      position: 0,
      last_modified: new Date(Date.now()),
      id: generateTempId()

    }

    AppState.addSurveyQuestion(Store.activeDashboardSurveyId, q)
    closeSurveyModal()

  }

  return (
    <dialog id="create_survey_question_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box relative">
        <button class="btn btn-outline rounded-full btn-error rounded-[.5rem] absolute p-0 w-8 h-8 top-1 right-1" onclick={closeSurveyModal}>
          <span class="text-xs">X</span>
        </button>
        <div class="flex gap-4 flex-wrap">

          <button class="btn btn-outline  btn-accent rounded-[.25rem]  p-0 w-32 h-8 top-1 right-1" onclick={() => pickQuestionType(SurveyQuestionType.TEXT)}>
            <span class="text-xs">Text</span>
          </button>

          <button class="btn btn-outline  btn-accent rounded-[.25rem]  p-0 w-32 h-8 top-1 right-1" onclick={() => pickQuestionType(SurveyQuestionType.NUMBER)}>
            <span class="text-xs">Number</span>
          </button>


          <button class="btn btn-outline  btn-accent rounded-[.25rem] p-0 w-32 h-8 top-1 right-1" onclick={() => pickQuestionType(SurveyQuestionType.BOOL)}>
            <span class="text-xs">Bool</span>
          </button>

          <button class="btn btn-outline  btn-accent rounded-[.25rem]  p-0 w-32 h-8 top-1 right-1" onclick={() => pickQuestionType(SurveyQuestionType.RATING)}>
            <span class="text-xs">Rating</span>
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default CreateQuestionDialog
