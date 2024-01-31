import { z } from "zod";
import { RIGHTS } from "../types";

export const userMetaEntity = z.object({
  id: z.string(),
  sort: z.literal("meta"),
  name: z.string(),
  email: z.string().email(),
  picture: z.string().url(),
  rights: z.enum(RIGHTS).array(),
});
