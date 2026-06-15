import { Component } from "solid-js";
import AppState from "~/state/state";
import { AnswerCardProps, BoolConfig } from "~/types";



const BoolAnswerCard: Component<AnswerCardProps> = (props) => {

  let config = JSON.parse(props.answer.config) as BoolConfig

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const value = target.value;

    let answer = props.answer
    answer.response = value
    AppState.upsertSurveyAnswers(props.surveyId, answer.questionId, answer)
  }

  return (

    <div class="w-[400px] h-[200px] flex flex-col gap-8">

      <div class="flex justify-start h-[100px]">
        <span class="text-content text-md italic font-bold">
          {props.answer.title}
        </span>
      </div>

      <div class="h-[100px] flex flex-col gap-2">

        <div class="flex gap-4 select-none">
          <input type="radio"
            name="radio-4"
            value="true"
            onInput={handleInput}
            class="radio radio-primary" checked={props.answer.response == "true"} />
          <span class=" text-sm">
            {config.trueLabel ?? "True"}
          </span>
        </div>

        <div class="flex gap-4 select-none">
          <input type="radio"
            name="radio-4"
            value="false"
            onInput={handleInput}
            class="radio radio-primary" checked={props.answer.response == "false"} />
          <span class=" text-sm">
            {config.falseLabel ?? "False"}
          </span>
        </div>

      </div>
    </div>
  )
}

export default BoolAnswerCard
