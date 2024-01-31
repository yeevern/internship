export const modelType = ["selection", "date", "number", "string"] as const;
export type ModelType = (typeof modelType)[number];

export interface ModelMeta {
  id: string;
  metaId: string;
  metaOwnerId: string;
  name: string;
  description?: string;
  type: ModelType;
}

interface ModelBase {
  metaId: string;
  modelId: string;
  createdAt: number;
  ownerId: string;
  type: ModelType;
}

export interface SelectionModel {
  type: Extract<ModelType, "selection">;
  selections: string[];
  allowOthers: boolean;
}

export interface DateModel {
  type: Extract<ModelType, "date">;
  min?: number;
  max?: number;
}

export interface NumberModel {
  type: Extract<ModelType, "number">;
  min?: number;
  max?: number;
}

export interface StringModel {
  type: Extract<ModelType, "string">;
  regex?: string;
}

export type ModelAttribute = ModelBase & (SelectionModel | DateModel | NumberModel | StringModel);

export type Model = ModelMeta &
  Omit<ModelBase, "createdAt"> &
  (SelectionModel | DateModel | NumberModel | StringModel) & {
    updatedAt: number;
  };
