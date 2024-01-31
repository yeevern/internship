import { z } from "zod";
import { generatePrefixedKey, parsePrefixedKey } from "@netizen/utils-aws";
import { randomId } from "@netizen/utils-string";
import { isTypeOf } from "@netizen/utils-types";
import { surveyLibConfiguration } from "../config";
import { SurveyErrorMessage, SurveyLibError } from "../error";
import { surveyMetaSchema } from "../survey/entities";
import { branchNodeSchema, leafNodeSchema, questionSchema, rootNodeSchema, formNodeSchema } from "./entities";
import { BranchCondition, BranchNode, FormNode, LeafNode, Question, SurveyForm } from "./types";

async function updateSurveyModifiedTimestamp(surveyId: string) {
  const { surveysTable } = surveyLibConfiguration;
  await surveysTable.update({
    schema: surveyMetaSchema,
    attributes: { partition: surveyId, sort: "meta", updatedAt: Date.now() },
  });
}

export async function initializeSinglePageSurveyForm(params: { surveyId: string; userId: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const [survey, root] = await Promise.all([
    surveysTable.get({
      schema: surveyMetaSchema,
      keys: { partition: params.surveyId, sort: "meta" },
    }),
    surveysTable.get({
      schema: rootNodeSchema,
      keys: { partition: params.surveyId, sort: "form#root" },
    }),
  ]);
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });
  if (root !== undefined)
    throw new SurveyLibError(`Survey form has already initialized for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_FORM_ALREADY_INITIALIZED,
      context: { surveyId: params.surveyId },
    });

  const branchId = randomId();
  const leafId = randomId();
  await surveysTable.batchWrite({
    items: [
      {
        type: "put",
        schema: rootNodeSchema,
        data: {
          partition: params.surveyId,
          sort: "form#root",
          title: "",
          destinationId: branchId,
        },
      },
      {
        type: "put",
        schema: branchNodeSchema,
        data: {
          partition: params.surveyId,
          sort: generatePrefixedKey("form#branch", branchId),
          title: "",
          randomizeQuestionOrder: false,
          destinationId: leafId,
        },
      },
      {
        type: "put",
        schema: leafNodeSchema,
        data: {
          partition: params.surveyId,
          sort: generatePrefixedKey("form#leaf", leafId),
          title: "",
        },
      },
    ],
  });
  await updateSurveyModifiedTimestamp(params.surveyId);

  return { branchId, leafId };
}

export async function createRoot(params: { surveyId: string; userId: string; title: string; description?: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const [survey, root] = await Promise.all([
    surveysTable.get({
      schema: surveyMetaSchema,
      keys: { partition: params.surveyId, sort: "meta" },
    }),
    surveysTable.get({
      schema: rootNodeSchema,
      keys: { partition: params.surveyId, sort: "form#root" },
    }),
  ]);
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });
  if (root !== undefined)
    throw new SurveyLibError(`Root node already exists in the survey form for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_FORM_ALREADY_INITIALIZED,
      context: { surveyId: params.surveyId },
    });

  await surveysTable.create({
    schema: rootNodeSchema,
    item: {
      partition: params.surveyId,
      sort: "form#root",
      title: params.title,
      description: params.description,
    },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);
}

export async function createBranch(params: {
  surveyId: string;
  userId: string;
  title: string;
  description?: string;
  randomizeQuestionOrder: boolean;
}) {
  const { surveysTable } = surveyLibConfiguration;

  const survey = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: params.surveyId, sort: "meta" },
  });
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });

  const branchId = randomId();
  await surveysTable.create({
    schema: branchNodeSchema,
    item: {
      partition: params.surveyId,
      sort: generatePrefixedKey("form#branch", branchId),
      title: params.title,
      description: params.description,
      randomizeQuestionOrder: params.randomizeQuestionOrder,
    },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);

  return { branchId };
}

export async function createLeaf(params: { surveyId: string; userId: string; title: string; description?: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const survey = await surveysTable.get({
    schema: surveyMetaSchema,
    keys: { partition: params.surveyId, sort: "meta" },
  });
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });

  const leafId = randomId();
  await surveysTable.create({
    schema: leafNodeSchema,
    item: {
      partition: params.surveyId,
      sort: generatePrefixedKey("form#leaf", leafId),
      title: params.title,
      description: params.description,
    },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);

  return { leafId };
}

export async function createQuestion(params: { surveyId: string; branchId: string } & Omit<Question, "id">) {
  const { surveysTable } = surveyLibConfiguration;

  const [survey, branch] = await Promise.all([
    surveysTable.get({
      schema: surveyMetaSchema,
      keys: { partition: params.surveyId, sort: "meta" },
    }),
    surveysTable.get({
      schema: branchNodeSchema,
      keys: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.branchId) },
    }),
  ]);
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId, branchId: params.branchId },
    });

  const questionId = randomId();
  await surveysTable.create({
    schema: questionSchema,
    item: {
      partition: params.surveyId,
      sort: generatePrefixedKey("question", questionId),
      branchId: params.branchId,
      questionIndex: params.questionIndex,
      modelId: params.modelId,
      type: params.type,
      question: params.question,
      helperText: params.helperText,
      isOptional: params.isOptional,
      selectionOptions: params.selectionOptions,
      randomizeOptionOrder: params.randomizeOptionOrder,
      min: params.min,
      max: params.max,
      regex: params.regex,
    },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);

  return { questionId };
}

type DbRootNode = z.infer<typeof rootNodeSchema>;
type DbBranchNode = z.infer<typeof branchNodeSchema>;
type DbLeafNode = z.infer<typeof leafNodeSchema>;
type DbQuestion = z.infer<typeof questionSchema>;

function categorizeNodes(nodes: z.infer<typeof formNodeSchema>[]) {
  return nodes.reduce<{ roots: DbRootNode[]; branches: DbBranchNode[]; leaves: DbLeafNode[] }>(
    (acc, node) => {
      switch (true) {
        case node.sort.startsWith("form#root"): {
          const parsedRoot = rootNodeSchema.safeParse(node);
          if (parsedRoot.success) acc.roots.push(parsedRoot.data);
          break;
        }
        case node.sort.startsWith("form#branch"): {
          const parsedBranch = branchNodeSchema.safeParse(node);
          if (parsedBranch.success) acc.branches.push(parsedBranch.data);
          break;
        }
        case node.sort.startsWith("form#leaf"): {
          const parsedLeaf = leafNodeSchema.safeParse(node);
          if (parsedLeaf.success) acc.leaves.push(parsedLeaf.data);
          break;
        }
      }
      return acc;
    },
    { roots: [], branches: [], leaves: [] },
  );
}

function constructSurveyFormTree(params: {
  nodes: { branches: DbBranchNode[]; leaves: DbLeafNode[] };
  questions: DbQuestion[];
  destinationId: string;
}) {
  const branch = params.nodes.branches.find((branch) => branch.sort.endsWith(params.destinationId));
  const leaf = params.nodes.leaves.find((leaf) => leaf.sort.endsWith(params.destinationId));

  if (branch === undefined && leaf === undefined)
    throw new SurveyLibError(`Cannot find branch/leaf node for the given "destinationId"`, {
      code: SurveyErrorMessage.INVALID_NODE_DESTINATION,
      context: { destinationId: params.destinationId },
    });

  if (branch) {
    const branchId = parsePrefixedKey("form#branch", branch.sort);
    const node: BranchNode = {
      id: branchId,
      type: "branch",
      title: branch.title,
      description: branch.description,
      randomizeQuestionOrder: branch.randomizeQuestionOrder,
      questions: params.questions.reduce<Question[]>((acc, q) => {
        if (q.branchId === branchId)
          acc.push({
            id: parsePrefixedKey("question", q.sort),
            questionIndex: q.questionIndex,
            modelId: q.modelId,
            type: q.type,
            question: q.question,
            helperText: q.helperText,
            isOptional: q.isOptional,
            selectionOptions: q.selectionOptions,
            randomizeOptionOrder: q.randomizeOptionOrder,
          });
        return acc;
      }, []),
      children: [],
    };
    if (branch.branchCondition) {
      const destination = constructSurveyFormTree({ ...params, destinationId: branch.branchCondition.destinationId });
      if (destination !== null) node.children?.push({ condition: branch.branchCondition.conditions, destination });
    }
    if (branch.destinationId) {
      const destination = constructSurveyFormTree({ ...params, destinationId: branch.destinationId });
      if (destination !== null) node.children?.push({ condition: null, destination });
    }
    return node;
  } else if (leaf) {
    const node: LeafNode = {
      id: parsePrefixedKey("form#leaf", leaf.sort),
      type: "leaf",
      title: leaf.title,
      description: leaf.description,
    };
    return node;
  }
  return null;
}

export async function getSurveyForm(surveyId: string) {
  const { surveysTable } = surveyLibConfiguration;

  const [meta, nodes, questions] = await Promise.all([
    surveysTable.get({
      schema: surveyMetaSchema,
      keys: { partition: surveyId, sort: "meta" },
    }),
    surveysTable.query({
      schema: formNodeSchema.passthrough(),
      attributes: { partition: surveyId, sort: "form#" },
      keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
    }),
    surveysTable.query({
      schema: questionSchema,
      attributes: { partition: surveyId, sort: "question#" },
      keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
    }),
  ]);
  if (meta === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId },
    });
  if (!nodes.length) return null;

  const { branches, leaves, roots } = categorizeNodes(nodes);
  if (!roots.length) return null; // @TODO: return unlinked nodes
  else if (roots.length > 1)
    throw new SurveyLibError(`Multiple root nodes found for the given "surveyId"`, {
      code: SurveyErrorMessage.MULTIPLE_ROOT_NODES,
      context: { surveyId },
    });

  const root = roots[0];
  const { destinationId: initialBranchId } = rootNodeSchema.parse(root);
  const initialBranch = constructSurveyFormTree({
    nodes: { branches, leaves },
    questions,
    destinationId: initialBranchId,
  });
  if (isTypeOf<BranchNode, FormNode | null>(initialBranch, (node) => node?.type === "branch")) {
    const surveyForm: SurveyForm = {
      surveyId,
      title: root.title,
      description: root.description,
      tree: initialBranch,
    };

    // @TODO: root, branches, leaves and questions are only used by unit tests, to remove/modify with better approach
    return {
      ...surveyForm,
      _root: root,
      _branches: branches,
      _leaves: leaves,
      _questions: questions,
    };
  }

  return null;
}

export async function updateRoot(params: {
  surveyId: string;
  title?: string;
  description?: string;
  destinationId?: string;
}) {
  const { surveysTable } = surveyLibConfiguration;

  const root = await surveysTable.get({
    schema: rootNodeSchema,
    keys: { partition: params.surveyId, sort: "form#root" },
  });
  if (root === undefined)
    throw new SurveyLibError(`Cannot find the root node of the survey form for the given "surveyId"`, {
      code: SurveyErrorMessage.ROOT_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });

  if (params.destinationId) {
    const destinationBranch = await surveysTable.get({
      schema: branchNodeSchema,
      keys: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.destinationId) },
    });
    if (destinationBranch === undefined)
      throw new SurveyLibError(
        `Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`,
        {
          code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
          context: { surveyId: params.surveyId, branchId: params.destinationId },
        },
      );
  }

  await surveysTable.update({
    schema: rootNodeSchema,
    attributes: { partition: params.surveyId, sort: "form#root", ...params },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);
}

export async function updateBranch(params: {
  surveyId: string;
  branchId: string;
  title?: string;
  description?: string;
  randomizeQuestionOrder?: boolean;
}) {
  const { branchId, surveyId, ...mutableBranchAttributes } = params;
  const { surveysTable } = surveyLibConfiguration;

  const branch = await surveysTable.get({
    schema: branchNodeSchema,
    keys: { partition: surveyId, sort: generatePrefixedKey("form#branch", branchId) },
  });
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId, branchId: params.branchId },
    });

  await surveysTable.update({
    schema: branchNodeSchema,
    attributes: { partition: surveyId, sort: generatePrefixedKey("form#branch", branchId), ...mutableBranchAttributes },
  });
  await updateSurveyModifiedTimestamp(surveyId);
}

export async function updateLeaf(params: { surveyId: string; leafId: string; title?: string; description?: string }) {
  const { leafId, surveyId, ...mutableBranchAttributes } = params;
  const { surveysTable } = surveyLibConfiguration;

  const leaf = await surveysTable.get({
    schema: leafNodeSchema,
    keys: { partition: surveyId, sort: generatePrefixedKey("form#leaf", leafId) },
  });
  if (leaf === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "leafId"`, {
      code: SurveyErrorMessage.LEAF_NODE_NOT_FOUND,
      context: { surveyId, leafId },
    });

  await surveysTable.update({
    schema: leafNodeSchema,
    attributes: { partition: surveyId, sort: generatePrefixedKey("form#leaf", leafId), ...mutableBranchAttributes },
  });
  await updateSurveyModifiedTimestamp(surveyId);
}

export async function updateQuestion(params: { surveyId: string; questionId: string } & Partial<Omit<Question, "id">>) {
  const { questionId, surveyId, ...mutableBranchAttributes } = params;
  const { surveysTable } = surveyLibConfiguration;

  const question = await surveysTable.get({
    schema: questionSchema,
    keys: { partition: surveyId, sort: generatePrefixedKey("question", questionId) },
  });
  if (question === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId" and "questionId"`, {
      code: SurveyErrorMessage.QUESTION_NOT_FOUND,
      context: { surveyId, questionId },
    });

  await surveysTable.update({
    schema: questionSchema,
    attributes: {
      partition: surveyId,
      sort: generatePrefixedKey("question", questionId),
      ...mutableBranchAttributes,
    },
  });
  await updateSurveyModifiedTimestamp(surveyId);
}

export async function updateQuestions(params: { surveyId: string; branchId: string; questions: Question[] }) {
  if (!params.questions.length)
    throw new SurveyLibError("No questions provided", { code: SurveyErrorMessage.NO_QUESTIONS_PROVIDED });

  const { surveysTable } = surveyLibConfiguration;

  const [survey, branch] = await Promise.all([
    surveysTable.get({
      schema: surveyMetaSchema,
      keys: { partition: params.surveyId, sort: "meta" },
    }),
    surveysTable.get({
      schema: branchNodeSchema,
      keys: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.branchId) },
    }),
  ]);
  if (survey === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "surveyId"`, {
      code: SurveyErrorMessage.SURVEY_NOT_FOUND,
      context: { surveyId: params.surveyId },
    });
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId, branchId: params.branchId },
    });

  // @TODO: validate questionIndex
  const questionIds: string[] = [];
  await surveysTable.batchWrite({
    items: params.questions.map(({ id, ...question }) => {
      questionIds.push(id);
      return {
        type: "put",
        schema: questionSchema,
        data: {
          partition: params.surveyId,
          sort: generatePrefixedKey("question", id),
          branchId: params.branchId,
          ...question,
        },
      };
    }),
  });
  await updateSurveyModifiedTimestamp(params.surveyId);

  return { surveyId: params.surveyId, branchId: params.branchId, questionIds };
}

interface LinkBranchParams {
  surveyId: string;
  sourceId: string;
  destinationId?: string;
  branchCondition?: { conditions: BranchCondition; destinationId: string };
}

export async function linkBranch({ branchCondition, destinationId, sourceId, surveyId }: LinkBranchParams) {
  if (destinationId === undefined && branchCondition === undefined)
    throw new SurveyLibError(`Either "destinationId" or "branchCondition" is required`, {
      code: SurveyErrorMessage.MISSING_NODE_DESTINATION,
    });

  const { surveysTable } = surveyLibConfiguration;

  const branches = await surveysTable.query({
    schema: branchNodeSchema,
    attributes: { partition: surveyId, sort: `form#branch#` },
    keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
  });
  if (!branches.find((branch) => branch.sort.endsWith(sourceId)))
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "sourceId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId, branchId: sourceId },
    });
  if (destinationId && !branches.find((branch) => branch.sort.endsWith(destinationId)))
    throw new SurveyLibError(
      `Cannot find the branch node of the survey form for the given "surveyId" and "destinationId"`,
      {
        code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
        context: { surveyId, branchId: destinationId },
      },
    );
  if (branchCondition && !branches.find((branch) => branch.sort.endsWith(branchCondition.destinationId)))
    throw new SurveyLibError(
      `Cannot find the branch node of the survey form for the given "surveyId" and "branchCondition.destinationId"`,
      {
        code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
        context: { surveyId, branchId: branchCondition.destinationId },
      },
    );

  await surveysTable.update({
    schema: branchNodeSchema,
    attributes: {
      partition: surveyId,
      sort: `form#branch#${sourceId}`,
      ...(destinationId ? { destinationId: destinationId } : {}),
      ...(branchCondition ? { branchCondition: branchCondition } : {}),
      // @TODO: prevent circular branches
    },
  });
  await updateSurveyModifiedTimestamp(surveyId);
}

export async function completeBranch({ branchCondition, destinationId, sourceId, surveyId }: LinkBranchParams) {
  const { surveysTable } = surveyLibConfiguration;

  const [branch, leafNodes] = await Promise.all([
    surveysTable.get({
      schema: branchNodeSchema,
      keys: { partition: surveyId, sort: generatePrefixedKey("form#branch", sourceId) },
    }),
    surveysTable.query({
      schema: leafNodeSchema,
      attributes: { partition: surveyId, sort: `form#leaf#` },
      keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
    }),
  ]);
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "sourceId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId, branchId: sourceId },
    });

  if (destinationId && !leafNodes.find((node) => node.sort.endsWith(destinationId)))
    throw new SurveyLibError(
      `Cannot find the branch node of the survey form for the given "surveyId" and "destinationId"`,
      {
        code: SurveyErrorMessage.LEAF_NODE_NOT_FOUND,
        context: { surveyId, branchId: destinationId },
      },
    );

  if (branchCondition && !leafNodes.find((node) => node.sort.endsWith(branchCondition.destinationId)))
    throw new SurveyLibError(
      `Cannot find the branch node of the survey form for the given "surveyId" and "branchCondition.destinationId"`,
      {
        code: SurveyErrorMessage.LEAF_NODE_NOT_FOUND,
        context: { surveyId, branchId: branchCondition.destinationId },
      },
    );

  await surveysTable.update({
    schema: branchNodeSchema,
    attributes: {
      partition: surveyId,
      sort: generatePrefixedKey("form#branch", sourceId),
      ...(destinationId ? { destinationId } : {}),
      ...(branchCondition ? { branchCondition } : {}),
    },
  });
  await updateSurveyModifiedTimestamp(surveyId);
}

export async function deleteBranch(params: { surveyId: string; branchId: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const [branch, questions] = await Promise.all([
    surveysTable.get({
      schema: branchNodeSchema,
      keys: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.branchId) },
    }),
    surveysTable.query({
      schema: questionSchema,
      attributes: { partition: params.surveyId, sort: `question#`, branchId: params.branchId },
      keyConditionExpression: "#partition = :partition AND begins_with( #sort, :sort )",
    }),
  ]);
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId, branchId: params.branchId },
    });

  await surveysTable.batchWrite({
    items: [
      {
        type: "delete",
        key: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.branchId) },
      },
      ...questions.map((question) => ({
        type: "delete" as const,
        key: { partition: params.surveyId, sort: question.sort },
      })),
    ],
  });
  await updateSurveyModifiedTimestamp(params.surveyId);
}

export async function unlinkBranch(params: { surveyId: string; branchId: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const branch = await surveysTable.get({
    schema: branchNodeSchema,
    keys: { partition: params.surveyId, sort: generatePrefixedKey("form#branch", params.branchId) },
  });
  if (branch === undefined)
    throw new SurveyLibError(`Cannot find the branch node of the survey form for the given "surveyId" and "branchId"`, {
      code: SurveyErrorMessage.BRANCH_NODE_NOT_FOUND,
      context: { surveyId: params.surveyId, branchId: params.branchId },
    });

  await surveysTable.update({
    schema: branchNodeSchema,
    attributes: {
      partition: params.surveyId,
      sort: generatePrefixedKey("form#branch", params.branchId),
      destinationId: undefined,
    },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);
}

export async function deleteQuestion(params: { surveyId: string; questionId: string }) {
  const { surveysTable } = surveyLibConfiguration;

  const question = await surveysTable.get({
    schema: questionSchema,
    keys: { partition: params.surveyId, sort: generatePrefixedKey("question", params.questionId) },
  });
  if (question === undefined)
    throw new SurveyLibError(`Cannot find survey for the given "questionId"`, {
      code: SurveyErrorMessage.QUESTION_NOT_FOUND,
      context: { questionId: params.questionId },
    });

  await surveysTable.remove({
    keys: { partition: params.surveyId, sort: generatePrefixedKey("question", params.questionId) },
  });
  await updateSurveyModifiedTimestamp(params.surveyId);
}
