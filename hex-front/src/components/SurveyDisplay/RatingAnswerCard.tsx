import { Component, For } from "solid-js";
import { number } from "zod";
import AppState from "~/state/state";
import { AnswerCardProps, RatingConfig } from "~/types";



const RatingAnswerCard: Component<AnswerCardProps> = (props) => {


  let config: RatingConfig = { max: 2 }

  try {

    config = JSON.parse(props.answer.config) as RatingConfig

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
        <div class="rating rating-lg flex gap-2">
          <For each={Array.from({ length: 5 })}>
            {(_, index) => (
              <input
                type="radio"
                name="rating-4"
                checked={(
                  () => {
                    let r = props.answer.response
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
      </div>
    </div>
  )

}


export default RatingAnswerCard
