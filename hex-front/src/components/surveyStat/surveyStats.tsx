import { For, Match, Switch } from "solid-js";
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

const SurveyStats: Component<PropsType> = (props) => {

  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <SurveyStatResource survey_id={props.survey_id} />
    </Suspense>
  )
}

const SurveyStatResource: Component<PropsType> = (props) => {
  const [ressource] = createResource<SurveyStat>(async () => {


    let response = await SurveyS.getSurveyStats(props.survey_id)

    let s_stat = response.result["content"] as SurveyStat

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

          //res.content = text_content
          break;


        default:
          break;
      }

      return res
    })


    console.log(stats)

    let elems: QuestionsStat[] = [
      {
        "id": "q1",
        "title": "question 1",
        "type": SurveyQuestionType.TEXT,
        "config": "",
        "content":
          {
            top_words: ["word1", "word2"]
          } as TextStatConfig
      },
      {
        "id": "q1",
        "title": "question 1",
        "type": SurveyQuestionType.TEXT,
        "config": "",
        "content":
          {
            top_words: ["word1", "word2", "word3", "word4", "word5"]
          } as TextStatConfig
      },
      {
        "id": "q1",
        "title": "Are you ready",
        "type": SurveyQuestionType.BOOL,
        "config": "",
        "content":
          {
            trueLabel: "Yes",
            falseLabel: "No",
            true_count: 13,
            false_count: 5
          } as BoolStatConfig
      },
      {
        "id": "q1",
        "title": "How much do you like this app ?",
        "type": SurveyQuestionType.RATING,
        "config": "",
        "content":
          {
            max: 5,
            avg: 3.5
          } as RatingStatConfig
      },
      {
        "id": "q1",
        "title": "Pick a number between 10 and 30 ?",
        "type": SurveyQuestionType.NUMBER,
        "config": "",
        "content":
          {
            max: 22,
            avg: 18,
            min: 16
          } as NumberStatConfig
      },


    ]


    return {
      id: props.survey_id,
      submission_count: s_stat.submission_count,
      stats: stats
    }
  })

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div class="flex justify-end ">
        <div class="stats shadow rounded-[.5rem] border-1 border-base-100  select-none">
          <div class="stat">
            <span class="stat-title">Total Submissions</span>
            <span class="stat-value">{ressource()?.submission_count}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-1 overflow-y-auto">
        <div class=" flex flex-col gap-8 max-h-[400px] w-full">
          <For each={ressource()?.stats}>
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
  data: QuestionsStat
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
