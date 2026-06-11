import { IoTrashBinOutline } from "solid-icons/io";
import { onCleanup, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import z from "zod";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { QuestionCardProps, SurveyQuestion } from "~/types";
import { debouncedSaveQuestion } from "~/utils";

const Schema = z.object({
  title: z.string()
    .min(1, "The question need to containt at least a character"),
})

const TextQuestionCard = (props: QuestionCardProps) => {

  let q: SurveyQuestion = unwrap(props.question)

  const handleTileError = () => {
    let err = Schema.pick({ title: true }).safeParse({ title: q.title })
    let key = `${props.question.id}:title`
    AppState.handleQuestionError(err, key, props.surveyId)
  }

  onCleanup(() => {
    debouncedSaveQuestion(props.surveyId, q);
  });

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    switch (target.name) {
      case "title":
        q.title = newValue
        handleTileError()
        break;

      default:
        break;
    }

    debouncedSaveQuestion(props.surveyId, q);
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
        <span class="text-xs text-content italic font-bold">Text</span>
      </div>
      <input
        type="text"
        name="title"
        value={q?.title ?? ""}
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        onInput={handleInput}
        placeholder={"Question ?"} />

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

export default TextQuestionCard
