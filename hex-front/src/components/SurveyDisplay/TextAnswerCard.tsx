import { useNavigate } from "@solidjs/router";
import { Component, Match, Show, Switch } from "solid-js";
import z from "zod";
import { SurveyS } from "~/services/surveyService";
import AppState from "~/state/state";
import { Store } from "~/state/store";
import { AnswerCardProps } from "~/types";

interface PropsType {

  data: AnswerCardProps

}

const TextAnswerCard: Component<PropsType> = (props) => {

  let input: HTMLInputElement | undefined
  const navigate = useNavigate()

  if (!props.data.answer) {
    return (
      <></>
    )
  }

  const handleError = () => {

    let key = `${props.data.answer.questionId}:value`
    let value = input?.value ?? ""
    const Schema = z.object({
      value: z.string()
        .min(1, "The answer needs to be at least 1 character long")
    })

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
    let success = await SurveyS.sendSurvey(props.data.surveyId, props.data.is_preview, props.data.key)
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
        <input
          ref={input}
          type="text"
          name="title"
          value={props.data.answer.response ?? ""}
          class="input w-full input-ghost border-[0px] border-b-[1px] border-primary rounded-[0px] focus:outline-0"
          required={true}
          onInput={handleInput}
          placeholder={"Answer ?"} />

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

export default TextAnswerCard
