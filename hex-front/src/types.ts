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
}

export interface RatingConfig {
  max: number
}

export interface NumberConfig {
  min: number
  max: number
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
}

// DB 
//

export interface CachedQuestions {
  survey_id: string
  questions: SurveyQuestion[]
}


