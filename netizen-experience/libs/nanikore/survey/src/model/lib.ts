import { randomUUID } from "crypto";
import { BatchItemParams, generatePrefixedKey, parsePrefixedKey } from "@netizen/utils-aws";
import { RequiredBy } from "@netizen/utils-types";
import { surveyLibConfiguration } from "../config";
import { SurveyErrorMessage, SurveyLibError } from "../error";
import { answerSchema } from "../survey/entities";
import {
  dateModelSchema,
  modelSchema,
  modelMetaSchema,
  numberModelSchema,
  selectionModelSchema,
  stringModelSchema,
} from "./entities";
import { DateModel, Model, ModelMeta, ModelType, NumberModel, SelectionModel, StringModel } from "./types";

function getTypedModelSchema(type: ModelType) {
  switch (type) {
    case "selection":
      return selectionModelSchema;
    case "date":
      return dateModelSchema;
    case "number":
      return numberModelSchema;
    case "string":
      return stringModelSchema;
    default:
      throw new SurveyLibError(`Unable to get schema for invalid model type`, {
        code: SurveyErrorMessage.MODEL_TYPE_IS_INVALID,
        context: { type },
      });
  }
}

export async function createModel({
  description,
  id,
  name,
  ownerId,
  type,
  ...attributes
}: {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  type: ModelType;
  selections?: string[];
  allowOthers?: boolean;
  min?: number;
  max?: number;
}) {
  const { modelsTable } = surveyLibConfiguration;
  const [meta] = await modelsTable.query({
    schema: modelMetaSchema,
    attributes: { partition: "meta", sort: id },
  });
  if (meta !== undefined)
    throw new SurveyLibError(`Model with the same "id" already existed`, {
      code: SurveyErrorMessage.MODEL_ALREADY_EXISTS,
      context: { id },
    });

  const metaId = randomUUID();
  const modelId = randomUUID();
  await modelsTable.batchWrite({
    items: [
      {
        schema: modelMetaSchema,
        data: {
          partition: "meta",
          sort: id,
          modelId: metaId,
          ownerId,
          name,
          description,
          type,
        },
      },
      {
        schema: getTypedModelSchema(type),
        data: {
          partition: metaId,
          sort: generatePrefixedKey("date", Date.now()),
          modelId,
          ownerId,
          type,
          ...attributes,
        },
      },
    ],
  });
  return { metaId, modelId };
}

export async function getModelById(id: string) {
  try {
    const { modelsTable } = surveyLibConfiguration;
    const meta = await modelsTable.get({
      schema: modelMetaSchema,
      keys: { partition: "meta", sort: id },
    });
    if (meta === undefined)
      throw new SurveyLibError(`Cannot find model meta for the given "id"`, {
        code: SurveyErrorMessage.MODEL_META_NOT_FOUND,
        context: { id },
      });

    const [modelAttributes] = await modelsTable.query({
      schema: modelSchema,
      attributes: { partition: meta.modelId, sort: "date#" },
      keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
      order: "descending",
    });
    if (modelAttributes === undefined)
      throw new SurveyLibError(`Cannot find model attribute for the given "modelId"`, {
        code: SurveyErrorMessage.MODEL_ATTRIBUTE_NOT_FOUND,
        context: { id, modelId: meta.modelId },
      });

    const { modelId, ownerId, partition: metaId, sort: dateSortKey, ...attributes } = modelAttributes;
    const model: Model = {
      id: meta.sort,
      modelId,
      metaId,
      metaOwnerId: meta.ownerId,
      ownerId,
      name: meta.name,
      description: meta.description,
      updatedAt: parseInt(parsePrefixedKey("date", dateSortKey)),
      ...attributes,
    };
    return model;
  } catch (e) {
    if (e instanceof TypeError)
      throw new SurveyLibError("Invalid model", { code: SurveyErrorMessage.MODEL_IS_INVALID, cause: e });
    else if (e instanceof Error)
      throw new SurveyLibError("Unknown error", { code: SurveyErrorMessage.UNKNOWN, cause: e });
    throw e;
  }
}

export async function getModelByModelId(modelId: string) {
  const { modelsTable } = surveyLibConfiguration;

  const [modelAttributes] = await modelsTable.query({
    schema: modelSchema,
    indexName: "modelIdGSI",
    attributes: { modelId },
  });
  if (modelAttributes === undefined)
    throw new SurveyLibError(`Cannot find model attribute for the given "modelId"`, {
      code: SurveyErrorMessage.MODEL_ATTRIBUTE_NOT_FOUND,
      context: { modelId },
    });

  const [meta] = await modelsTable.query({
    schema: modelMetaSchema,
    indexName: "modelIdLSI",
    attributes: { partition: "meta", modelId: modelAttributes.partition },
  });
  if (meta === undefined)
    throw new SurveyLibError(`Cannot find model meta for the given "modelId"`, {
      code: SurveyErrorMessage.MODEL_META_NOT_FOUND,
      context: { modelId },
    });

  const { modelId: _, ownerId, partition: metaId, sort: dateSortKey, ...attributes } = modelAttributes;
  const model: Model = {
    id: meta.sort,
    modelId,
    metaId,
    metaOwnerId: meta.ownerId,
    ownerId,
    name: meta.name,
    description: meta.description,
    updatedAt: parseInt(parsePrefixedKey("date", dateSortKey)),
    ...attributes,
  };
  return model;
}

export async function listModelMetas() {
  const { modelsTable } = surveyLibConfiguration;
  const metas = await modelsTable.query({
    schema: modelMetaSchema,
    attributes: { partition: "meta" },
    order: "ascending",
  });
  return metas.map<ModelMeta>((meta) => ({
    id: meta.sort,
    metaId: meta.modelId,
    metaOwnerId: meta.ownerId,
    name: meta.name,
    description: meta.description,
    type: meta.type,
  }));
}

type UpdateModelParams = Omit<RequiredBy<ModelMeta, "id">, "metaId" | "metaOwnerId"> & { ownerId: string } & (
    | RequiredBy<SelectionModel, "type">
    | RequiredBy<DateModel, "type">
    | RequiredBy<NumberModel, "type">
    | RequiredBy<StringModel, "type">
  );

export async function updateModel(params: UpdateModelParams) {
  const { modelsTable } = surveyLibConfiguration;
  const { description, id, name, ...attributes } = params;
  const [meta] = await modelsTable.query({
    schema: modelMetaSchema,
    attributes: { partition: "meta", sort: id },
  });
  if (meta === undefined)
    throw new SurveyLibError(`Cannot find model meta for the given "id"`, {
      code: SurveyErrorMessage.MODEL_ATTRIBUTE_NOT_FOUND,
      context: { id },
    });

  const hasAttributeUpdates = Object.keys(attributes).length > 0;
  const modelId = randomUUID();
  const items: BatchItemParams[] = [];
  if (name !== undefined || description !== undefined)
    items.push({
      schema: modelMetaSchema,
      data: {
        ...meta,
        name: name ?? meta.name,
        description: description ?? meta.description,
        type: attributes.type ?? meta.type,
      },
    });
  if (hasAttributeUpdates)
    items.push({
      schema: getTypedModelSchema(attributes.type),
      data: {
        partition: meta.modelId,
        sort: generatePrefixedKey("date", Date.now()),
        modelId,
        ...attributes,
      },
    });
  await modelsTable.batchWrite({ items });
  return hasAttributeUpdates ? { modelId } : {};
}

async function isModelInUse(modelId: string) {
  const { modelsTable } = surveyLibConfiguration;
  const [answer] = await modelsTable.query({
    schema: answerSchema,
    indexName: "modelIdGSI",
    attributes: { modelId, sort: "answer#" },
    keyConditionExpression: "#modelId = :modelId AND begins_with( #sort, :sort )",
    limit: 1,
  });
  return answer !== undefined;
}

export async function deleteModelAttribute(modelId: string) {
  const { modelsTable } = surveyLibConfiguration;
  const [model] = await modelsTable.query({
    schema: modelSchema,
    indexName: "modelIdGSI",
    attributes: { partition: modelId },
  });
  if (model === undefined)
    throw new SurveyLibError(`Cannot find model attribute with given "modelId"`, {
      code: SurveyErrorMessage.MODEL_ATTRIBUTE_NOT_FOUND,
      context: { modelId },
    });
  else if (await isModelInUse(modelId))
    throw new SurveyLibError("Cannot delete model attribute that is currently in use in an existing survey", {
      code: SurveyErrorMessage.MODEL_ATTRIBUTE_IS_IN_USE,
      context: { modelId },
    });

  await modelsTable.remove({
    keys: { partition: model.partition, sort: model.sort },
  });
}

export async function deleteModel(id: string) {
  const { modelsTable } = surveyLibConfiguration;
  const [meta] = await modelsTable.query({
    schema: modelMetaSchema,
    attributes: { partition: "meta", sort: id },
  });
  if (meta === undefined)
    throw new SurveyLibError(`Cannot find model meta for the given "id"`, {
      code: SurveyErrorMessage.MODEL_META_NOT_FOUND,
      context: { id },
    });
  const models = await modelsTable.query({
    schema: modelSchema,
    attributes: { partition: meta.modelId, sort: "date#" },
    keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
  });
  let canDelete = false;
  try {
    // Fulfills if any of the modelIds are in use
    canDelete = await Promise.any(
      models.map(async ({ modelId }) => {
        if (await isModelInUse(modelId)) return false;
        throw new Error();
      }),
    );
  } catch (e) {
    // AggregateError is thrown if all model attribute entries are not in use
    if (e instanceof AggregateError) canDelete = true;
  }
  if (!canDelete)
    throw new SurveyLibError(
      "Cannot delete model because some of its attributes are currently in use in existing survey",
      {
        code: SurveyErrorMessage.MODEL_ATTRIBUTE_IS_IN_USE,
        context: { id },
      },
    );
  await modelsTable.remove({
    keys: { partition: "meta", sort: id },
  });
}
