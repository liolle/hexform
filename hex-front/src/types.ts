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

export interface SurveyQuestionError {
  field: string
  value: string
}

export interface QuestionCardProps {
  surveyId: string
  questionId: string
  question: SurveyQuestion
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
}

// DB 
//

export interface CachedQuestions {
  survey_id: string
  questions: SurveyQuestion[]
}


