import { Component, createEffect, For } from "solid-js"
import { SurveyData } from "~/services/surveyService"
import AppState from "~/state/state"
import { Store } from "~/state/store"


const PublicSurveys: Component = () => {

  createEffect(async () => {
    AppState.updatePublicSurveys()
  })

  return (
    <SurveysBody />
  )
}


const SurveysBody = () => {
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

  return (
    <div class=" relative h-24 border-base-100 p-1 border-b-1 rounded-[0.25rem] select-none flex flex-col cursor-pointer hover:bg-base-100"
    >
      <div class="max-w-[400px]">
        <span class="text-content text-sm font-medium"> {props.data.title} </span>
      </div>
      <div class="max-w-[400px] wrap-anywhere leading-none">
        <span class=" text-content text-xs opacity-60"> {props.data.description} </span>
      </div>
    </div>
  )
}

export default PublicSurveys
