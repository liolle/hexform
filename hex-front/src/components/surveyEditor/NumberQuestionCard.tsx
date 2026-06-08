import { IoTrashBinOutline } from "solid-icons/io";
import { Show } from "solid-js";
import z from "zod";
import AppState from "~/state/state";
import { SetStore, Store } from "~/state/store";
import { NumberConfig, QuestionCardProps, SurveyQuestion } from "~/types";
import { AllowDigitOnly, debounce } from "~/utils";

const Schema = z.object({
  title: z.string()
    .min(1, "The question need to containt at least a character"),
})

export const NumberQuestionCard = (props: QuestionCardProps) => {

  let question = AppState.surveyQuestions[props.surveyId]?.find(v => v.id == props.question.id)
  let q: SurveyQuestion = question ?? props.question
  let config: NumberConfig = q.config ? JSON.parse(q.config) : {};

  const debouncedSave = debounce(() => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, q, false);
  }, 500);

  const handleTileError = () => {

    let err = Schema.pick({ title: true }).safeParse({ title: q.title })
    let key = `${props.question.id}:title`

    AppState.removeQuestionError(props.surveyId, key)

    SetStore("surveyQuestionsErrors", props.surveyId, (prev = []) =>
      prev.filter(q => q.field !== key)
    )

    if (!err.error) {

      return
    }

    let msg = err.error.issues[0].message

    SetStore("surveyQuestionsErrors", props.surveyId, (prev = []) => {

      return [...prev, { field: key, value: msg }]
    })

    AppState.upsertQuestionError(props.surveyId, key, msg)
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

    debouncedSave();
  }


  let errors = () => {
    let sErr = Store.surveyQuestionsErrors[props.surveyId] ?? []
    return sErr.filter(v => {
      let rexp = new RegExp(`${props.question.id}:*`)
      return rexp.test(v.field)
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
        value={question?.title ?? ""}
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
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8" onclick={() => AppState.removeSurveyQuestion(props.surveyId, props.question.id)}>
          <IoTrashBinOutline />
        </button>
      </div>
    </div>
  )
}
