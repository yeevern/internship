interface SelectionAnswer {
  selectionValue: string[];
}

interface DateAnswer {
  dateValue: number;
}

interface NumberAnswer {
  numberValue: number;
}

interface StringAnswer {
  stringValue: string;
}

export type Answer = {
  surveyId: string;
  createdAt: number;
  ownerId: string;
  modelId: string;
} & (SelectionAnswer | DateAnswer | NumberAnswer | StringAnswer);

export const surveyStatus = ["draft", "ready", "active", "closed"] as const;
export type SurveyStatus = (typeof surveyStatus)[number];

export interface SurveyMeta {
  surveyId: string;
  createdAt: number;
  updatedAt?: number;
  ownerId: string;
  status: SurveyStatus;
  startDate: number;
  endDate: number;
  title: string;
  description?: string;
}

export interface SurveyAccess {
  userId: string;
  createdAt: number;
  surveyId: string;
}
