import { Component, createEffect, For, Match, Show, Switch } from "solid-js"
import AppState from "~/state/state"
import { SetStore, Store } from "~/state/store"
import { SurveyData } from "~/types"
import SurveysPanel from "./SurveysPanel"
import { SurveyS } from "~/services/surveyService"
import { useNavigate } from "@solidjs/router"


const PublicSurveys: Component = () => {
  const navigate = useNavigate()
  createEffect(async () => {
    AppState.updatePublicSurveys()
  })


  const participate = () => {
    let surveyId = Store.activeSurveyId
    if (!surveyId) {
      return
    }

    SurveyS.invalidateSurvey(surveyId)
    navigate(`/survey/${surveyId}`)
  }

  let activeSurvey = () => Store.publcSurveys?.find(v => v.id == Store.activeSurveyId)

  return (
    <div class="flex-1 p-[16px] pt-0 flex flex-col gap-4">
      <SurveysPanel />
      <Surveys />

    </div>

  )
}


const Surveys = () => {
  return (
    <div class="flex-1 flex bg-transparent flex flex-col gap-2">
      <div class="h-fit min-h-screen">
        <For each={Store.publcSurveys}>
          {(item, index) =>
            <SurveyCard data={item} />
          }
        </For>
      </div>
    </div>
  )
}


interface SurveysCardProps {
  data: SurveyData
}

const SurveyCard = (props: SurveysCardProps) => {
  const navigate = useNavigate()

  const participate = () => {
    let surveyId = props.data.id
    if (!surveyId) {
      return
    }

    SurveyS.invalidateSurvey(surveyId)
    SetStore("surveyAnswersErrors", surveyId, () => [])
    SetStore("surveyAnswers", surveyId, () => [])
    navigate(`/survey/${surveyId}`)
  }

  return (
    <div class=" relative h-24 border-base-100 p-1 border-b-1 rounded-[0.25rem] select-none flex justify-between">
      <div class="max-w-[400px] flex flex-col self-start">
        <div class="max-w-[400px]">
          <span class="text-content text-sm font-medium"> {props.data.title} </span>
        </div>
        <div class="max-w-[400px] wrap-anywhere leading-none">
          <span class=" text-content text-xs opacity-60"> {props.data.description} </span>
        </div>
      </div>

      <Switch >
        <Match when={!props.data.submited}>
          <button class="btn btn-soft btn-primary rounded-[.5rem] self-end" onclick={participate}>
            <span class="text-content text-sm font-medium">
              Participate
            </span>
          </button>
        </Match>
        <Match when={props.data.submited}>
          <span class="text-accent text-sm font-medium itatlic self-end">
            submited
          </span>
        </Match>

      </Switch>
    </div>
  )
}

export default PublicSurveys
