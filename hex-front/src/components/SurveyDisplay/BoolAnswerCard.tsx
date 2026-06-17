import { useNavigate } from "@solidjs/router";
import { Component, Match, Show, Switch } from "solid-js";
import { SurveyS } from "~/services/surveyService";
import DB, { DBStoreNames } from "~/state/database";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { AnswerCardProps, BoolConfig, SurveyAnswers } from "~/types";

interface PropsType {
  data: AnswerCardProps
}

const BoolAnswerCard: Component<PropsType> = (props) => {
  const navigate = useNavigate()
  let refTrue: HTMLInputElement | undefined
  let refFalse: HTMLInputElement | undefined

  let config = JSON.parse(props.data.answer.config) as BoolConfig

  const handleError = () => {

    let key = `${props.data.answer.questionId}:value`
    if (!refTrue || !refFalse) {
      return
    }

    AppState.removeAnswerError(props.data.surveyId, key)
    if (!refTrue.checked && !refFalse.checked) {
      AppState.upsertAnswerError(props.data.surveyId, key, "Make sure to pick an answer")
    }
  }

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    let answer = props.data.answer
    answer.response = value
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

        <div class="flex gap-4">
          <div class="flex gap-4 select-none">
            <input type="radio"
              ref={refTrue}
              name="radio-4"
              value="true"
              onInput={handleInput}
              class="radio radio-primary" checked={props.data.answer.response == "true"} />
            <span class=" text-sm">
              {config.trueLabel ?? "True"}
            </span>
          </div>

          <div class="flex gap-4 select-none">
            <input type="radio"
              ref={refFalse}
              name="radio-4"
              value="false"
              onInput={handleInput}
              class="radio radio-primary" checked={props.data.answer.response == "false"} />
            <span class=" text-sm">
              {config.falseLabel ?? "False"}
            </span>
          </div>
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

export default BoolAnswerCard
