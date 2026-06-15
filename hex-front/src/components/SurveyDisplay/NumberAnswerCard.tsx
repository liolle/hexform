
import { Component } from "solid-js";
import AppState from "~/state/state";
import { AnswerCardProps, NumberConfig } from "~/types";



const NumberAnswerCard: Component<AnswerCardProps> = (props) => {
  let config: NumberConfig = { min: 0, max: 100 }

  try {
    config = JSON.parse(props.answer.config) as NumberConfig
  } catch (error) {
  }

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    let answer = props.answer
    answer.response = newValue

    AppState.upsertSurveyAnswers(props.surveyId, answer.questionId, answer)
  }

  return (

    <div class="w-[400px] h-[200px] flex flex-col gap-8">

      <div class="flex justify-start h-[100px]">
        <span class="text-content text-md italic font-bold">
          {props.answer.title}
        </span>
      </div>

      <div class="h-[100px]">
        <input
          type="number"
          min={config.min}
          max={config.max}
          name="response"
          value={props.answer.response ?? ""}
          class="input w-full  rounded-[0px] focus:outline-0"
          required={true}
          onInput={handleInput}
        />
      </div>

    </div>
  )
}


export default NumberAnswerCard
