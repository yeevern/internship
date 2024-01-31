"use server";

import { revalidatePath } from "next/cache";
import { deleteModel, updateModel } from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";

export async function updateModelAction(params: Omit<Parameters<typeof updateModel>[0], "metaOwnerId" | "ownerId">) {
  const { user } = await authCheck([RIGHTS.ADMIN]);
  await updateModel({ ownerId: user.id, ...params });
  revalidatePath("/dashboard/models");
}

export async function deleteModelAction(id: string) {
  await deleteModel(id);
  revalidatePath("/dashboard/models");
}
