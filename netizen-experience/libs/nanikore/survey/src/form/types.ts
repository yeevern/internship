import type { NonEmptyArray } from "@netizen/utils-types";

export const questionType = [
  "radio",
  "checkbox",
  "selection",
  "singleDate",
  "multiDate",
  "dateRange",
  "integer",
  "rating",
  "shortText",
  "longText",
] as const;
export type QuestionType = (typeof questionType)[number];

export const comparisonOperator = ["eq", "ne", "gt", "ge", "lt", "le", "in", "notIn"] as const;
export type ComparisonOperator = (typeof comparisonOperator)[number];

interface Comparator {
  operator: ComparisonOperator;
  value: string[] | number | string;
}

export interface Question {
  id: string;
  questionIndex: number;
  skipCondition?: Comparator & { destinationIndex: number };
  modelId: string;
  type: QuestionType;
  question: string;
  helperText?: string;
  isOptional: boolean;
  selectionOptions: { value: string; label: string }[];
  randomizeOptionOrder: boolean;
  min?: number;
  max?: number;
  regex?: string;
}

export type FormNodeType = "root" | "branch" | "leaf";
export type BranchCondition = NonEmptyArray<NonEmptyArray<Comparator & { modelId: string }>>;

export interface LeafNode {
  id: string;
  type: Extract<FormNodeType, "leaf">;
  title: string;
  description?: string;
}

export interface BranchNodeMeta {
  id: string;
  type: Extract<FormNodeType, "branch">;
  title: string;
  description?: string;
  randomizeQuestionOrder: boolean;
}

export interface BranchNode extends BranchNodeMeta {
  questions: Question[];
  children: { condition: BranchCondition | null; destination: BranchNode | LeafNode }[];
}

export type FormNode = BranchNode | LeafNode;

export interface SurveyForm {
  surveyId: string;
  title: string;
  description?: string;
  tree: BranchNode;
}
