import { Component, createEffect, createSignal, Match, Show, Switch } from "solid-js"
import { SurveyData, SurveyAnswer, SurveyQuestionType, SurveyAnswers, AnswerCardProps } from "~/types"
import ProgressIndicator from "./progressIndicator"
import { SurveyS } from "~/services/surveyService"
import TextAnswerCard from "./TextAnswerCard"
import BoolAnswerCard from "./BoolAnswerCard"
import RatingAnswerCard from "./RatingAnswerCard"
import NumberAnswerCard from "./NumberAnswerCard"
import { Store } from "~/state/store"
import { unwrap } from "solid-js/store"

interface SurveyDisplayProps {
  surveyId: string,
  preview: boolean
}

const SurveyDisplay: Component<SurveyDisplayProps> = (props: SurveyDisplayProps) => {
  const [position, setPosition] = createSignal(0)
  const [answers, setAnswers] = createSignal<SurveyAnswer[]>([])
  let questions = unwrap(Store.surveyQuestions[props.surveyId]) ?? []


  const extract = async () => {



    let qs = questions.map(v => {

      let q: SurveyAnswer = {
        questionId: v.id,
        title: v.title,
        response: "",
        config: v.config,
        type: v.type,
        position: v.position
      }

      return q
    })

    qs.sort((a, b) => a.position - b.position)


    console.log(questions)
    console.log(qs)
    setAnswers(qs)

    let answers: SurveyAnswers = {
      survey_id: props.surveyId,
      responses: qs,
      position: 0
    }

    let resolvedAnswers = SurveyS.resolveAnswers(props.surveyId, answers)
    setAnswers(resolvedAnswers.responses)
    setPosition(resolvedAnswers.position)

  }

  extract()


  let answer = () => {
    let pos = position()
    let ans = answers()
    return ans[pos]
  }

  return (
    <div class="flex flex-col h-full">
      <div class="h-24 flex justify-center items-center">
        <div class="w-[400px] flex justify-center overflow-x-auto">
          <ProgressIndicator setPosition={setPosition} position={position} surveyId={props.surveyId} />
        </div>
      </div>
      <div class="flex flex-col flex-1 justify-center items-center">
        <QuestionCard surveyId={props.surveyId} answer={answer()} position={position} setPosition={setPosition} answer_count={answers().length} is_preview={props.preview} />
      </div>
    </div>
  )
}



const QuestionCard: Component<AnswerCardProps> = (props: AnswerCardProps) => {


  return (
    <div class="">
      <Switch>

        <Match when={props.answer && props.answer.type == SurveyQuestionType.TEXT}>
          <TextAnswerCard data={props} />
        </Match>

        <Match when={props.answer && props.answer.type == SurveyQuestionType.BOOL}>
          <BoolAnswerCard data={props} />
        </Match>

        <Match when={props.answer && props.answer.type == SurveyQuestionType.NUMBER}>
          <NumberAnswerCard data={props} />
        </Match>

        <Match when={props.answer && props.answer.type == SurveyQuestionType.RATING}>
          <RatingAnswerCard data={props} />
        </Match>

      </Switch>
    </div>
  )
}


export default SurveyDisplay
