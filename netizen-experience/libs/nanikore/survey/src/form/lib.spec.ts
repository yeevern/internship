import { randomUUID } from "crypto";
import { add } from "date-fns";
import { generatePrefixedKey, parsePrefixedKey } from "@netizen/utils-aws";
import { randomId } from "@netizen/utils-string";
import { isUuid } from "@netizen/utils-types";
import { SurveyErrorMessage, SurveyLibError } from "../error";
import { createSurvey, deleteSurveyPermanently, getSurvey } from "../survey/lib";
import {
  createBranch,
  createRoot,
  deleteBranch,
  deleteQuestion,
  getSurveyForm,
  initializeSinglePageSurveyForm,
  linkBranch,
  updateBranch,
  updateRoot,
  updateQuestions,
} from "./lib";

async function getSurveyMetaAndForm(surveyId: string) {
  const [meta, form] = await Promise.all([getSurvey(surveyId), getSurveyForm(surveyId)]);
  return { meta, form };
}

async function assertError(promise: Promise<unknown>, code: SurveyErrorMessage) {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(SurveyLibError);
    if (e instanceof SurveyLibError) expect(e.code).toBe(code);
  }
}

describe("form", () => {
  const userId = randomUUID();
  let surveyId: string;

  beforeAll(async () => {
    const now = Date.now();
    surveyId = (
      await createSurvey({
        ownerId: randomUUID(),
        title: randomId(),
        description: randomId(),
        status: "draft",
        startDate: add(now, { days: 7 }).getTime(),
        endDate: add(now, { days: 14 }).getTime(),
      })
    ).surveyId;
    expect(isUuid(surveyId)).toBe(true);
  });

  test("branch crud operations", async () => {
    const errorPromises: Promise<unknown>[] = [];
    let now = Date.now();
    let { form, meta } = await getSurveyMetaAndForm(surveyId);
    expect(form).toBeNull();

    // Initialize survey form
    errorPromises.push(
      assertError(
        initializeSinglePageSurveyForm({ surveyId: randomId(), userId }),
        SurveyErrorMessage.SURVEY_NOT_FOUND,
      ),
    );
    now = Date.now();
    const singlePageForm = await initializeSinglePageSurveyForm({ surveyId, userId });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form.title).toBe("");
      expect(form._branches).toHaveLength(1);
      expect(form._leaves).toHaveLength(1);
      expect(form.tree.id).toBe(singlePageForm.branchId);
      expect(form.tree.id).toBe(parsePrefixedKey("form#branch", form._branches[0].sort));
    }

    errorPromises.push(
      assertError(createRoot({ surveyId: randomId(), userId, title: "" }), SurveyErrorMessage.SURVEY_NOT_FOUND),
      assertError(createRoot({ surveyId, userId, title: "" }), SurveyErrorMessage.SURVEY_FORM_ALREADY_INITIALIZED),
      assertError(
        initializeSinglePageSurveyForm({ surveyId, userId }),
        SurveyErrorMessage.SURVEY_FORM_ALREADY_INITIALIZED,
      ),
    );

    // Create branch
    const title = randomId();
    const description = randomId();
    now = Date.now();
    const { branchId } = await createBranch({
      surveyId,
      userId,
      title,
      description,
      randomizeQuestionOrder: true,
    });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form._branches).toContainEqual({
        partition: surveyId,
        sort: generatePrefixedKey("form#branch", branchId),
        title,
        description,
        randomizeQuestionOrder: true,
      });
    }

    // Update branch
    errorPromises.push(
      assertError(updateBranch({ surveyId, branchId: randomId() }), SurveyErrorMessage.BRANCH_NODE_NOT_FOUND),
    );
    const updatedTitle = randomId();
    const updatedDescription = randomId();
    now = Date.now();
    await updateBranch({
      surveyId,
      branchId,
      title: updatedTitle,
      description: updatedDescription,
      randomizeQuestionOrder: false,
    });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form._branches).toContainEqual({
        partition: surveyId,
        sort: generatePrefixedKey("form#branch", branchId),
        title: updatedTitle,
        description: updatedDescription,
        randomizeQuestionOrder: false,
      });
    }

    // Delete branch
    now = Date.now();
    await deleteBranch({ surveyId, branchId });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form._branches).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            partition: surveyId,
            sort: generatePrefixedKey("form#branch", branchId),
          }),
        ]),
      );
    }
  });

  test("question crud operations", async () => {
    const errorPromises = [];

    // Create question
    const { branchId } = await createBranch({
      surveyId,
      userId,
      title: randomId(),
      description: randomId(),
      randomizeQuestionOrder: true,
    });
    const dummyQuestion = {
      id: randomId(),
      questionIndex: 0,
      modelId: randomUUID(),
      type: "radio" as const,
      question: randomId(),
      helperText: randomId(),
      isOptional: false,
      selectionOptions: [{ value: randomId(), label: randomId() }],
      randomizeOptionOrder: false,
    };

    errorPromises.push(
      assertError(updateQuestions({ surveyId, branchId, questions: [] }), SurveyErrorMessage.NO_QUESTIONS_PROVIDED),
      assertError(
        updateQuestions({ surveyId: "_", branchId, questions: [dummyQuestion] }),
        SurveyErrorMessage.SURVEY_NOT_FOUND,
      ),
      assertError(
        updateQuestions({ surveyId, branchId: "_", questions: [dummyQuestion] }),
        SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      ),
    );
    let now = Date.now();
    const { questionIds } = await updateQuestions({ surveyId, branchId, questions: [dummyQuestion] });

    let { form, meta } = await getSurveyMetaAndForm(surveyId);
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(questionIds).toHaveLength(1);
      expect(form._questions).toHaveLength(1);
      expect(form._questions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            partition: surveyId,
            sort: generatePrefixedKey("question", questionIds[0]),
            branchId,
            ...dummyQuestion,
          }),
        ]),
      );
    }

    // Delete question
    errorPromises.push(
      assertError(deleteQuestion({ surveyId, questionId: randomId() }), SurveyErrorMessage.QUESTION_NOT_FOUND),
    );
    now = Date.now();
    await deleteQuestion({ surveyId, questionId: questionIds[0] });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form._questions).toHaveLength(0);
      expect(form._questions).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            partition: surveyId,
            sort: generatePrefixedKey("question", questionIds[0]),
          }),
        ]),
      );
    }

    await deleteBranch({ surveyId, branchId });
    await Promise.all(errorPromises);
  });

  test.todo("branching logic", async () => {
    const errorPromises = [];

    // Check root node is linked to initial branch
    let { form, meta } = await getSurveyMetaAndForm(surveyId);
    if (form !== null) {
      expect(form._root).toEqual({
        partition: surveyId,
        sort: "form#root",
        title: "",
        // destinationId: initialBranchId,
      });
    }

    // Update root node
    errorPromises.push(
      assertError(updateRoot({ surveyId, destinationId: randomId() }), SurveyErrorMessage.BRANCH_NODE_NOT_FOUND),
    );
    const updatedTitle = randomId();
    const updatedDescription = randomId();
    const { branchId: branchId2 } = await createBranch({
      surveyId,
      userId,
      title: randomId(),
      description: randomId(),
      randomizeQuestionOrder: true,
    });
    const now = Date.now();
    await updateRoot({ surveyId, destinationId: branchId2, title: updatedTitle, description: updatedDescription });

    ({ form, meta } = await getSurveyMetaAndForm(surveyId));
    expect(meta.updatedAt).toBeGreaterThanOrEqual(now);
    expect(form).not.toBeNull();
    if (form !== null) {
      expect(form._root).toEqual({
        partition: surveyId,
        sort: "form#root",
        title: updatedTitle,
        description: updatedDescription,
        destinationId: branchId2,
      });
    }

    // Link branches
    errorPromises.push(
      assertError(linkBranch({ surveyId, sourceId: branchId2 }), SurveyErrorMessage.MISSING_NODE_DESTINATION),
      assertError(
        linkBranch({ surveyId, sourceId: randomId(), destinationId: branchId2 }),
        SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      ),
      assertError(
        linkBranch({ surveyId, sourceId: branchId2, destinationId: randomId() }),
        SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      ),
      assertError(
        linkBranch({
          surveyId,
          sourceId: branchId2,
          branchCondition: { conditions: [[{ modelId: "", operator: "eq", value: "" }]], destinationId: randomId() },
        }),
        SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      ),
    );

    await Promise.all(errorPromises);
  });

  afterAll(async () => {
    await deleteSurveyPermanently({ surveyId });
    await assertError(getSurvey(surveyId), SurveyErrorMessage.SURVEY_NOT_FOUND);
  });
});
