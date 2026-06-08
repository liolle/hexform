import { SurveyData } from "~/services/surveyService"
import { For, Match, Switch } from "solid-js"
import { Store } from "~/state/store"
import { QuestionCardProps, SurveyQuestionType } from "~/types"
import TextQuestionCard from "./TextQuestionCard"
import { RatingQuestionCard } from "./RatingQuestionCard"
import { NumberQuestionCard } from "./NumberQuestionCard"
import { BoolQuestionCard } from "./BooleanQuestionCard"
import { unwrap } from "solid-js/store"

interface SurveyEditorProps {
  survey: SurveyData | undefined
}

const SurveyEditor = (props: SurveyEditorProps) => {

  let survey = props.survey

  if (!survey) {
    return (
      <div class="flex justify-center items-center">
        <span class="text-sm text-content">Invalid survey</span>
      </div>
    )
  }

  let questions = () => {
    let sq = Store.surveyQuestions
    return sq[survey.id]
  }

  return (
    <div class="flex flex-col gap-4 relative overflow-y-auto" >
      <div class="max-h-[700px]">
        <For each={questions()}>
          {(item, index) =>
            <QuestionCard surveyId={survey.id} question={item} />
          }
        </For>
      </div>
    </div>
  )
}

const QuestionCard = (props: QuestionCardProps) => {

  return (
    <div>
      <Switch>
        <Match when={props.question.type == SurveyQuestionType.TEXT}>
          <TextQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.BOOL}>
          <BoolQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.NUMBER}>
          <NumberQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.RATING}>
          <RatingQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>
      </Switch>
    </div>
  )

}

export default SurveyEditor
