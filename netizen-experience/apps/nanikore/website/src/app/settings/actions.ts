"use server";

import { cache } from "react";
import { authCheck } from "@/auth";

export const getSettings = cache(async () => {
  //@TODO: Add data according to sidebar menu
  const [{ user: account }] = await Promise.all([authCheck()]);

  return { account };
});
