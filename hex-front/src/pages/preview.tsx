import { useParams } from "@solidjs/router";
import { Component, createEffect, createSignal, Match, Switch } from "solid-js";
import SurveyDisplay from "~/components/SurveyDisplay/SurveyDisplay";
import { SurveyS } from "~/services/surveyService";
import { SurveyData } from "~/types";


const PreviewPage: Component = () => {
  const params = useParams();
  const [survey, setSurvey] = createSignal<SurveyData | undefined>()

  createEffect(async () => {
    if (!params.id) {
      return
    }

    let response = await SurveyS.getSurvey(params.id, "", true)

    if (response.result.status >= 300) {
      return
    }

    let survey: SurveyData = response.result.content["data"]["survey"]


    if (!survey) {
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
          <SurveyDisplay surveyId={survey()?.id ?? ""} preview key="" />
        </Match>
      </Switch>
    </div>

  )
}


export default PreviewPage
