
import { useNavigate } from "@solidjs/router";
import { Component, Match, Show, Switch } from "solid-js";
import { SurveyS } from "~/services/surveyService";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { AnswerCardProps, NumberConfig } from "~/types";

interface PropsType {
  data: AnswerCardProps
}


const NumberAnswerCard: Component<PropsType> = (props) => {
  let config: NumberConfig = { min: 0, max: 100 }
  const navigate = useNavigate()

  try {
    config = JSON.parse(props.data.answer.config) as NumberConfig
  } catch (error) {
  }


  const handleError = () => {
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
      return rexp.test(v.field)
    }).map(v => v.value)
  }

  const next = () => {
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

    <div class="w-[400px] h-[200px] flex flex-col gap-8">

      <div class="flex justify-start h-[100px]">
        <span class="text-content text-md italic font-bold">
          {props.data.answer.title}
        </span>
      </div>

      <div class="h-[100px]">
        <input
          type="number"
          min={config.min}
          max={config.max}
          name="response"
          value={props.data.answer.response ?? ""}
          class="input w-full  rounded-[0px] focus:outline-0"
          required={true}
          onInput={handleInput}
        />
      </div>

      <Show when={errors().length > 0}>
        <span class="text-error text-xs h-[2rem] overflow-hidden">
          {errors()[0]}
        </span>
      </Show>

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


export default NumberAnswerCard
