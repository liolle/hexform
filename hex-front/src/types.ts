import { Accessor, Setter } from "solid-js"
import { int } from "zod/mini"

export enum SurveyQuestionType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  RATING = "RATING",
  BOOL = "BOOL",
  MULTI_PICK = "MULTI_PICK"
}

export interface SurveyQuestion {
  id: string
  type: SurveyQuestionType
  title: string
  last_modified: Date
  config: string
  position: number
}

export interface SurveyAnswer {
  questionId: string
  type: SurveyQuestionType
  title: string
  config: string
  response: string
  position: number
}

export interface SurveyAnswers {
  survey_id: string
  position: number
  responses: SurveyAnswer[]
}

export interface SurveyQuestionError {
  key: string
  value: string
}

export interface QuestionCardProps {
  surveyId: string
  questionId: string
  question: SurveyQuestion
}

export interface AnswerCardProps {
  surveyId: string
  answer_count: number
  is_preview: boolean
  answer: SurveyAnswer
  position: Accessor<number>
  setPosition: Setter<number>
  key: string
}

export interface RatingConfig {
  max: number
  mean: number
}

export interface NumberConfig {
  min: number
  max: number
  mean: number
}

export interface BoolConfig {
  trueLabel: string
  falseLabel: string
}


export enum SurveyState {
  CREATED = "CREATED",
  PUBLISHED = "PUBLISHED",
  DONE = "DONE"
}

export interface SurveyData {
  id: string
  title: string
  description: string
  state: SurveyState
  owner_id: string
  is_public: boolean
  created_at: Date
  questions: SurveyQuestion[]
  submited: boolean
}

export interface SurveyDataExtened {
  submited: boolean
  survey: SurveyData
}

export interface QuestionsStat {
  id: string
  title: string
  type: SurveyQuestionType
  config: string
  content: RatingStatConfig | NumberStatConfig | BoolStatConfig | TextStatConfig
}

export interface SurveyStat {
  id: string,
  submission_count: number
  stats: QuestionsStat[]
}


export interface RatingStatConfig {
  max: number
  avg: number
  std: number
}

export interface NumberStatConfig {
  min: number
  max: number
  avg: number
  std: number
}

export interface BoolStatConfig {
  trueLabel: string
  falseLabel: string
  true_count: number
  false_count: number
}

export interface TextStatConfig {
  top_words: string[]
}



// DB 

export interface CachedQuestions {
  survey_id: string
  questions: SurveyQuestion[]
}


