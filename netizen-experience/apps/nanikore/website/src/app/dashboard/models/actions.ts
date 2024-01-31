"use server";

import { revalidatePath } from "next/cache";
import { createModel } from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";

export async function createModelAction(params: Omit<Parameters<typeof createModel>[0], "id" | "ownerId">) {
  const { user } = await authCheck([RIGHTS.ADMIN]);
  const { description, name, type, ...attributes } = params;
  const id = name.trim().toLowerCase().replace(/[\W_]/g, "-").replace(/--+/g, "-");
  const { metaId, modelId } = await createModel({
    id,
    ownerId: user.id,
    name,
    description,
    type,
    ...attributes,
  });
  revalidatePath("/dashboard/models");
  return { id, metaId, modelId };
}
