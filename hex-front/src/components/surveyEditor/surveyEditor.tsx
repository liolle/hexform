import { SurveyS } from "~/services/surveyService"
import { Component, createEffect, For, Match, Switch } from "solid-js"
import { SetStore, Store } from "~/state/store"
import { QuestionCardProps, SurveyData, SurveyQuestion, SurveyQuestionType } from "~/types"
import TextQuestionCard from "./TextQuestionCard"
import { RatingQuestionCard } from "./RatingQuestionCard"
import { NumberQuestionCard } from "./NumberQuestionCard"
import { BoolQuestionCard } from "./BooleanQuestionCard"
import { AiFillCaretDown, AiFillCaretUp } from "solid-icons/ai"
import AppState from "~/state/state"

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


  createEffect(async () => {
    //await SurveyS.invalidateSurvay(survey.id)
    let res = await SurveyS.getSurvey(survey.id, true)
    let questions: SurveyQuestion[] = res.result.content["survey"]["questions"] ?? []
    let resolvedQuestions = await SurveyS.resolveQuestions(survey.id, questions)

    SetStore("surveyQuestions", survey.id, (prev) => [...resolvedQuestions])
  })

  let questions = () => {
    let sq = Store.surveyQuestions
    return sq[survey.id]
  }

  return (
    <div class="flex flex-col gap-4 relative overflow-y-auto" >
      <div class="max-h-[700px]">
        <For each={questions()}>
          {(item, index) =>
            <QuestionCard surveyId={survey.id} questionId={item.id} question={item} />
          }
        </For>
      </div>
    </div>
  )
}

const QuestionCard: Component<QuestionCardProps> = (props: QuestionCardProps) => {

  const pushUp = () => {
    AppState.pushUpQuestion(props.surveyId, props.questionId)
  }

  const pushDown = () => {
    AppState.pushDownQuestion(props.surveyId, props.questionId)
  }


  return (
    <div class="relative">
      <div class="absolute top-[1rem] right-[.5rem] flex flex-col gap-2">
        <button class="btn btn-soft btn-outline btn-info rounded-[.25rem] p-0 w-8 h-4" onclick={pushUp}>
          <AiFillCaretUp />
        </button>

        <button class="btn btn-soft btn-outline btn-info rounded-[.25rem] p-0 w-8 h-4" onclick={pushDown}>
          <AiFillCaretDown />
        </button>
      </div>
      <Switch>
        <Match when={props.question.type == SurveyQuestionType.TEXT}>
          <TextQuestionCard surveyId={props.surveyId} questionId={props.questionId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.BOOL}>
          <BoolQuestionCard surveyId={props.surveyId} questionId={props.questionId} question={props.question} />

        </Match>

        <Match when={props.question.type == SurveyQuestionType.NUMBER}>
          <NumberQuestionCard surveyId={props.surveyId} questionId={props.questionId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.RATING}>
          <RatingQuestionCard surveyId={props.surveyId} questionId={props.questionId} question={props.question} />
        </Match>
      </Switch>
    </div>
  )

}

export default SurveyEditor
