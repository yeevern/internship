export interface ListAssistantAfterParams {
  after: string;
}

export interface ListAssistantBeforeParams {
  before: string;
}

export type ListAssistantParams = ListAssistantAfterParams | ListAssistantBeforeParams;
