import { Component, createEffect, createSignal, Match, Show, Switch } from "solid-js"
import { SurveyData, SurveyAnswer, SurveyQuestionType, SurveyAnswers, AnswerCardProps } from "~/types"
import ProgressIndicator from "./progressIndicator"
import { SurveyS } from "~/services/surveyService"
import TextAnswerCard from "./TextAnswerCard"
import BoolAnswerCard from "./BoolAnswerCard"
import AppState from "~/state/state"
import RatingAnswerCard from "./RatingAnswerCard"
import NumberAnswerCard from "./NumberAnswerCard"
import DB, { DBStoreNames } from "~/state/database"
import { useNavigate } from "@solidjs/router"

interface SurveyDisplayProps {
  survey: SurveyData | undefined,
  preview: boolean
}

const SurveyDisplay: Component<SurveyDisplayProps> = (props: SurveyDisplayProps) => {

  const navigate = useNavigate()
  const [position, setPosition] = createSignal(0)
  const [answers, setAnswers] = createSignal<SurveyAnswer[]>([])

  if (!props.survey) {
    return <></>
  }


  createEffect(async () => {
    if (!props.survey) {
      return
    }

    let qs = props.survey.questions.map(v => {

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

    setAnswers(qs)

    let answers: SurveyAnswers = {
      survey_id: props.survey.id,
      responses: qs,
      position: 0
    }

    let resolvedAnswers = await SurveyS.resolveAnswers(props.survey.id, answers)
    setAnswers(resolvedAnswers.responses)
    setPosition(resolvedAnswers.position)
  })

  let answer = () => {
    let pos = position()
    let ans = answers()

    return ans[pos]
  }

  const next = () => {
    let n = Math.min(answers().length - 1, position() + 1)
    setPosition(n)
    if (!props.survey) {
      return
    }

    AppState.upsertSurveyAnswersPosition(props.survey.id, n)
  }


  const submit = async () => {
    if (!props.survey) {
      return
    }

    let data = await DB.getFromKey(DBStoreNames.SURVEY_ANSWERS, props.survey.id) as SurveyAnswers
    if (!data) {
      return
    }

    await DB.deleteFromKey(DBStoreNames.SURVEY_ANSWERS, props.survey.id)

    if (!props.preview) {
      // Send survey
      console.log("send", data)

    }

    navigate("/home", { replace: true })
  }

  return (
    <div class="flex flex-col h-full">
      <div class="h-24 flex justify-center items-center">
        <div class="w-[400px] flex justify-center overflow-x-auto">
          <ProgressIndicator setPosition={setPosition} position={position} questions={props.survey.questions} surveyId={props.survey.id} />
        </div>
      </div>
      <div class="flex flex-col flex-1 justify-center items-center">
        <QuestionCard surveyId={props.survey.id} answer={answer()} position={position} setPosition={setPosition} answer_count={answers().length} is_preview={props.preview} />
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
