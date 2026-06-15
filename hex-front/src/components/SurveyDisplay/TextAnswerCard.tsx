import { Component } from "solid-js";
import AppState from "~/state/state";
import { AnswerCardProps } from "~/types";


const TextAnswerCard: Component<AnswerCardProps> = (props: AnswerCardProps) => {

  if (!props.answer) {
    return (
      <></>
    )
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
          type="text"
          name="title"
          value={props.answer.response ?? ""}
          class="input w-full input-ghost border-[0px] border-b-[1px] border-primary rounded-[0px] focus:outline-0"
          required={true}
          onInput={handleInput}
          placeholder={"Answer ?"} />
      </div>
    </div>
  )
}

export default TextAnswerCard
