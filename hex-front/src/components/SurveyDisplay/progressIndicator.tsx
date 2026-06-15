import { Accessor, For, Setter } from "solid-js"
import AppState from "~/state/state"
import { SurveyQuestion } from "~/types"


interface SurveyPreviewIndicatorProps {
  questions: SurveyQuestion[]
  setPosition: Setter<number>
  position: Accessor<number>
  surveyId: string
}

const ProgressIndicator = (props: SurveyPreviewIndicatorProps) => {

  const handleStepClick = (index: number) => {
    if (index < 0 || index >= props.questions.length) {
      return
    }
    props.setPosition(index)

    AppState.upsertSurveyAnswersPosition(props.surveyId, index)
  }

  const baseStyle = "border-dashed border-[1px] border-(--color-content) h-10 w-10 rounded-full cursor-pointer"

  let style = (index: number) => {
    let additionalClass: string[] = []

    if (props.position() == index) {
      additionalClass.push("border-[2px]")
    }

    return `${baseStyle} ${additionalClass.join(" ")}`
  }

  return (
    <div class=" flex gap-12">
      <For each={props.questions}>
        {(item, index) =>
          <button class={`${style(index())}`} onclick={() => handleStepClick(index())} >
            <span class="text-content">
              {index() + 1}
            </span>
          </button>
        }
      </For>
    </div>
  )
}

export default ProgressIndicator

