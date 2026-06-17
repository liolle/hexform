import { useNavigate } from "@solidjs/router";
import { Component, For, Match, Show, Switch } from "solid-js";
import z, { number } from "zod";
import { SurveyS } from "~/services/surveyService";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { AnswerCardProps, RatingConfig } from "~/types";

interface PropsType {
  data: AnswerCardProps
}


const RatingAnswerCard: Component<PropsType> = (props) => {

  const navigate = useNavigate()

  let config: RatingConfig = { max: 2 }

  try {

    config = JSON.parse(props.data.answer.config) as RatingConfig

  } catch (error) {

  }

  const handleError = () => {

    let key = `${props.data.answer.questionId}:value`

    let content = Store.surveyAnswers[props.data.surveyId].find(v => v.questionId == props.data.answer.questionId)?.response ?? ""

    const Schema = z.object({
      value: z.number()
        .min(1, `The value must be between 1 and ${config.max}`)
        .max(config.max, `The value must be between 1 and ${config.max}`),
    })

    let value = parseInt(content ?? "")

    if (Number.isNaN(value)) {
      value = 0
    }

    let err = Schema.safeParse({ value: value })

    AppState.handleAnswersError(err, key, props.data.surveyId)
  }

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;


    let answer = props.data.answer
    answer.response = newValue

    AppState.upsertSurveyAnswers(props.data.surveyId, answer.questionId, answer)
  }

  let errors = () => {
    let sErr = Store.surveyAnswersErrors[props.data.surveyId] ?? []
    return sErr.filter(v => {
      let rexp = new RegExp(`${props.data.answer.questionId}:.*`)
      return rexp.test(v.key)
    }).map(v => v.value)
  }

  const next = () => {
    handleError()
    let n = Math.min(props.data.answer_count - 1, props.data.position() + 1)
    props.data.setPosition(n)
    AppState.upsertSurveyAnswersPosition(props.data.surveyId, n)
  }

  const submit = async () => {
    let success = await SurveyS.sendSurvey(props.data.surveyId, props.data.is_preview)
    if (!success) {
      return
    }

    navigate("/home", { replace: true })
  }

  return (

    <div class="w-[400px] h-[300px] flex flex-col">

      <div class="flex justify-start h-[100px]">
        <span class="text-content text-md italic font-bold">
          {props.data.answer.title}
        </span>
      </div>

      <div class="h-[100px] flex flex-col gap-2">
        <div class="rating rating-lg flex gap-2">
          <For each={Array.from({ length: 5 })}>
            {(_, index) => (
              <input
                type="radio"
                name="rating-4"
                checked={(
                  () => {
                    let r = props.data.answer.response
                    if (!r) {
                      return false
                    }

                    let star = parseInt(r, 10)
                    let pos = index() + 1


                    return pos <= star
                  }
                )()}
                onInput={handleInput}
                class="mask mask-star-2 bg-primary"
                value={index() + 1}
              />
            )}
          </For>
        </div>
        <Switch>
          <Match when={errors().length > 0}>
            <span class="text-error text-xs h-[2rem] overflow-hidden">
              {errors()[0]}
            </span>
          </Match>
          <Match when={true}>
            <span class="text-error text-xs h-[2rem] overflow-hidden">
            </span>
          </Match>
        </Switch>

      </div>

      <div class="flex justify-end w-[400px]">
        <Switch>
          <Match when={props.data.position() < props.data.answer_count - 1}>
            <button class="btn btn-soft btn-primary rounded-[.5rem]" onclick={next}>
              <span class="text-content text-sm font-medium">
                Continue
              </span>
            </button>
          </Match>
          <Match when={true}>
            <button class="btn btn-soft btn-primary rounded-[.5rem]" onclick={submit}>
              <span class="text-content text-sm font-medium">
                Submit
              </span>
            </button>
          </Match>
        </Switch>
      </div>

    </div>
  )

}


export default RatingAnswerCard
