import { createSignal, For, Match, Switch } from "solid-js";
import { Component, createResource, Suspense } from "solid-js";
import { BoolStatConfig, NumberStatConfig, QuestionsStat, RatingConfig, RatingStatConfig, SurveyQuestionType, SurveyStat, TextStatConfig } from "~/types";
import TextQuestionCard from "../surveyEditor/TextQuestionCard";
import TextStatCard from "./textQuestionStatCard";
import BooleanStatCard from "./booleanQuestionStatCard";
import RatingStatCard from "./ratingQuestionStatCard";
import NumberStatCard from "./numberQuestionStatCard";
import { SurveyS } from "~/services/surveyService";

interface PropsType {
  survey_id: string
}

interface SurveyStatRessourceType {
  data: SurveyStat,
  keys: string[]
}

const SurveyStats: Component<PropsType> = (props) => {

  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <SurveyStatResource survey_id={props.survey_id} />
    </Suspense>
  )
}



const SurveyStatResource: Component<PropsType> = (props) => {
  const [link, setLink] = createSignal("")
  const [ressource] = createResource<SurveyStatRessourceType>(async () => {


    let response = await SurveyS.getSurveyStats(props.survey_id)
    let key_response = await SurveyS.getSurveyKeys(props.survey_id)

    let s_stat = response.result["content"] as SurveyStat
    let keys = key_response.result["content"]["keys"] as string[]

    const BASE_URL = import.meta.env.VITE_CLIENT_URL || '';
    let key = keys[0] ?? ""
    let link = `${BASE_URL}/${props.survey_id}${key == "" ? "" : `?key=${key}`}`
    setLink(link)

    let stats: QuestionsStat[] = s_stat.stats.map(v => {
      let res = {
        ...v
      } as QuestionsStat


      switch (v.type) {
        case SurveyQuestionType.BOOL:
          let bool_content = v.content as BoolStatConfig
          let bool_config: BoolStatConfig = JSON.parse(v.config)
          bool_content.trueLabel = bool_config.trueLabel
          bool_content.falseLabel = bool_config.falseLabel
          res.content = bool_content
          break;

        case SurveyQuestionType.TEXT:
          let text_content = v.content as TextStatConfig

          text_content.top_words = text_content.top_words.map(v => {
            return v.split("-")[0]
          })

          break;

        case SurveyQuestionType.RATING:
          let rating_content = v.content as RatingStatConfig
          let rating_config: RatingConfig = JSON.parse(v.config)

          rating_content.max = rating_config.max

          break;




        default:
          break;
      }

      return res
    })

    return {
      keys: keys,
      data: {
        id: props.survey_id,
        submission_count: s_stat.submission_count,
        stats: stats
      }

    }
  })

  const copyLink = () => {
    navigator.clipboard.writeText(link())
  }

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div class="flex justify-between ">
        <div class="flex justify-end items-end gap-4 select-none">
          <div class="flex justify-between items-center gap-4 h-12">
            <span class="stat-title max-w-[400px] truncate" >{link()}</span>
            <div class="btn btn-ghost btn-accent rounded-[.5rem] " onclick={copyLink}>
              <span class="text-xs">Copy</span>
            </div>
          </div>
        </div>
        <div class="stats shadow rounded-[.5rem] border-1 border-base-100  select-none">
          <div class="stat">
            <span class="stat-title">Total Submissions</span>
            <span class="stat-value">{ressource()?.data.submission_count}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-1 overflow-y-auto">
        <div class=" flex flex-col gap-8 max-h-[400px] w-full">
          <For each={ressource()?.data.stats}>
            {
              (item, idex) => {
                return (
                  <StatCard data={item} />
                )
              }
            }
          </For>
        </div>
      </div>
    </div>
  )
}

interface StartCardProps {
  data: QuestionsStat,
}

const StatCard: Component<StartCardProps> = (props) => {

  return (
    <Switch>
      <Match when={props.data.type == SurveyQuestionType.TEXT} >
        <TextStatCard config={JSON.stringify(props.data.content)} title={props.data.title} />
      </Match>

      <Match when={props.data.type == SurveyQuestionType.BOOL} >
        <BooleanStatCard config={JSON.stringify(props.data.content)} title={props.data.title} />
      </Match>

      <Match when={props.data.type == SurveyQuestionType.RATING} >
        <RatingStatCard config={JSON.stringify(props.data.content)} title={props.data.title} />
      </Match>

      <Match when={props.data.type == SurveyQuestionType.NUMBER} >
        <NumberStatCard config={JSON.stringify(props.data.content)} title={props.data.title} />
      </Match>


    </Switch>
  )
}

export default SurveyStats 
