import { IoTrashBinOutline } from "solid-icons/io";
import { onCleanup, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import z from "zod";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { NumberConfig, QuestionCardProps, SurveyQuestion } from "~/types";
import { AllowDigitOnly, debouncedSaveQuestion } from "~/utils";

const Schema = z.object({
  title: z.string()
    .min(1, "The question need to containt at least a character"),
})

export const NumberQuestionCard = (props: QuestionCardProps) => {

  let q: SurveyQuestion = unwrap(props.question)
  let config: NumberConfig = q.config ? JSON.parse(q.config) : {};

  const handleTileError = () => {
    let err = Schema.pick({ title: true }).safeParse({ title: q.title })
    let key = `${props.question.id}:title`
    AppState.handleQuestionError(err, key, props.surveyId)
  }


  const deleteQuestion = () => {
    AppState.removeSurveyQuestion(props.surveyId, props.question.id)
  }

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    try {
      switch (target.name) {
        case "title":
          q.title = newValue
          handleTileError()
          break;
        case "max":
          config.max = newValue == "" ? 0 : parseInt(newValue)
          q.config = JSON.stringify(config)
          break;

        case "min":
          config.min = newValue == "" ? 0 : parseInt(newValue)
          q.config = JSON.stringify(config)
          break;


        default:
          break;
      }

    } catch (error) {

    }


    debouncedSaveQuestion(props.surveyId, q);
  }


  let errors = () => {
    let sErr = Store.surveyQuestionsErrors[props.surveyId] ?? []
    return sErr.filter(v => {
      let rexp = new RegExp(`${props.question.id}:*`)
      return rexp.test(v.key)
    }).map(v => v.value)
  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Number</span>
      </div>

      <input
        type="text"
        name="title"
        value={q?.title ?? ""}
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        onInput={handleInput}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <fieldset class="fieldset  flex gap-[2rem] ">
          <input
            type="number"
            name="min"
            value={config?.min ?? ""}
            class="input rounded-[.5rem] focus:outline-0 w-24"
            onkeydown={AllowDigitOnly}
            required={true}
            onInput={handleInput}
            placeholder={"min"} />

          <input
            type="number"
            name="max"
            value={config?.max ?? ""}
            class="input rounded-[.5rem] focus:outline-0 w-24"
            required={true}
            onkeydown={AllowDigitOnly}
            onInput={handleInput}
            placeholder={"max"} />

        </fieldset>

      </div>

      <div class="flex ">
        <div class="flex-1">
          <Show when={errors().length > 0}>
            <span class="text-error text-xs h-[2rem] overflow-hidden">
              {errors()[0]}
            </span>
          </Show>
        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8" onclick={deleteQuestion}>
          <IoTrashBinOutline />
        </button>
      </div>
    </div>
  )
}
