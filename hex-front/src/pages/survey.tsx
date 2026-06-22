import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { Component, createEffect, createSignal, Match, Switch } from "solid-js";
import SurveyDisplay from "~/components/SurveyDisplay/SurveyDisplay";
import { SurveyS } from "~/services/surveyService";
import { SurveyData } from "~/types";


const SurveyCompletionPage: Component = () => {
  const navigate = useNavigate()
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [survey, setSurvey] = createSignal<SurveyData | undefined>()
  const [key, setKey] = createSignal("")

  createEffect(async () => {
    if (!params.id) {
      return
    }

    let k = (searchParams["key"] ?? "") as string
    setKey(k)

    let response = await SurveyS.getSurvey(params.id, k, true)

    if (response.result.status >= 300) {
      return
    }

    let survey: SurveyData = response.result.content["data"]["survey"]
    let submited: boolean = response.result.content["data"]["submited"]

    if (!survey) {
      navigate("/home", { replace: true })
      return
    }

    if (submited) {
      navigate("/home", { replace: true })
      return
    }


    let resolvedQuestions = await SurveyS.resolveQuestions(survey.id, survey.questions)

    if (resolvedQuestions) {
      survey.questions = resolvedQuestions
    }

    setSurvey(survey)
  })

  return (

    <div class="h-screen bg-base-300">
      <Switch>
        <Match when={!survey()}>
          <span>
            404 Unknown survey
          </span>
        </Match>
        <Match when={!!survey()}>
          <SurveyDisplay surveyId={survey()?.id ?? ""} preview={false} key={key()} />
        </Match>
      </Switch>
    </div>

  )
}


export default SurveyCompletionPage
