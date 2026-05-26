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
