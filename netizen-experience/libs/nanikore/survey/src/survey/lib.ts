import { randomUUID } from "crypto";
import { isBefore } from "date-fns";
import { z } from "zod";
import { RequiredBy } from "@netizen/utils-types";
import { surveyLibConfiguration } from "../config";
import { SurveyErrorMessage, SurveyLibError } from "../error";
import { surveyMetaSchema } from "./entities";
import { SurveyMeta, SurveyStatus } from "./types";

export async function createSurvey(params: Omit<SurveyMeta, "surveyId" | "createdAt" | "updatedAt">) {
  const { surveysTable } = surveyLibConfiguration;
  const surveyId = randomUUID();
  await surveysTable.create({
    schema: surveyMetaSchema,
    item: {
      partition: surveyId,
      sort: "meta",
      createdAt: Date.now(),
      ...params,
    },
  });
  return { surveyId };
}

export async function getSurvey(surveyId: string) {
  const { surveysTable } = surveyLibConfiguration;
  const meta = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: surveyId, sort: "meta" },
  });
  if (meta === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId },
    });

  const survey: SurveyMeta = {
    surveyId: meta.partition,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    ownerId: meta.ownerId,
    status: meta.status,
    startDate: meta.startDate,
    endDate: meta.endDate,
    title: meta.title,
    description: meta.description,
  };
  return survey;
}

export async function listUpcomingSurveys() {
  const { surveysTable } = surveyLibConfiguration;
  const [draftSurveys, readySurveys] = await Promise.all([
    surveysTable.query({
      schema: surveyMetaSchema,
      indexName: "statusGSI",
      attributes: { status: "draft", startDate: Date.now() },
      filterExpression: "#startDate >= :startDate",
    }),
    surveysTable.query({
      schema: surveyMetaSchema,
      indexName: "statusGSI",
      attributes: { status: "ready", startDate: Date.now() },
      filterExpression: "#startDate >= :startDate",
    }),
  ]);
  const result: SurveyMeta[] = [draftSurveys, readySurveys].flat().map((survey) => ({
    surveyId: survey.partition,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    ownerId: survey.ownerId,
    status: survey.status,
    startDate: survey.startDate,
    endDate: survey.endDate,
    title: survey.title,
    description: survey.description,
  }));
  return result;
}

export async function listActiveSurveys() {
  const { surveysTable } = surveyLibConfiguration;
  const activeSurveys = await surveysTable.query({
    schema: surveyMetaSchema,
    indexName: "statusGSI",
    attributes: { status: "active" },
  });
  const result: SurveyMeta[] = activeSurveys.map((survey) => ({
    surveyId: survey.partition,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    ownerId: survey.ownerId,
    status: survey.status,
    startDate: survey.startDate,
    endDate: survey.endDate,
    title: survey.title,
    description: survey.description,
  }));
  return result;
}

export async function updateSurvey({
  surveyId,
  ...attributes
}: RequiredBy<Omit<SurveyMeta, "createdAt" | "updatedAt">, "surveyId">) {
  const { surveysTable } = surveyLibConfiguration;

  const survey = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: surveyId, sort: "meta" },
  });
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId },
    });

  await surveysTable.update({
    schema: surveyMetaSchema,
    attributes: { partition: surveyId, sort: "meta", ...attributes, updatedAt: Date.now() },
  });
}

export async function publishSurvey({ publish, surveyId }: { surveyId: string; publish: boolean }) {
  const { surveysTable } = surveyLibConfiguration;

  const survey = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: surveyId, sort: "meta" },
  });
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId },
    });

  let status: SurveyStatus;
  if (publish) status = isBefore(Date.now(), survey.startDate) ? "ready" : "active";
  else status = "draft";

  await surveysTable.update({
    schema: surveyMetaSchema,
    attributes: { partition: surveyId, sort: "meta", updatedAt: Date.now(), status },
  });
}

// @TODO: soft delete

export async function deleteSurveyPermanently({ surveyId }: { surveyId: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const survey = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: surveyId, sort: "meta" },
  });
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId },
    });
  if (survey.status !== "draft")
    throw new SurveyLibError(`Cannot delete survey once it is published`, {
      code: SurveyErrorMessage.SURVEY_IS_IN_USE,
      context: { surveyId },
    });

  const surveyRelatedItems = await surveysTable.query({
    schema: z.object({ partition: z.string(), sort: z.string() }),
    attributes: { partition: surveyId },
  });
  await surveysTable.batchWrite({
    items: surveyRelatedItems.map((item) => ({
      type: "delete" as const,
      key: { partition: item.partition, sort: item.sort },
    })),
  });
}
