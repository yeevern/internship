import { randomUUID } from "crypto";
import { z } from "zod";
import { promptLibConfig } from "../../init";
import { dalleHistorySchema } from "../../lib/entities";
import { lambdaDalleSaveHistoryEventSchema } from "../entities";

export async function handler(event: z.infer<typeof lambdaDalleSaveHistoryEventSchema>) {
  const { promptBucket, promptTable } = promptLibConfig;
  lambdaDalleSaveHistoryEventSchema.parse(event);
  const image = await fetch(event.openAiResponse.url);
  const imageBuffer = await image.arrayBuffer();
  const key = `${event.id}/dalle/${randomUUID()}.png`;
  await promptBucket.upload({
    Key: key,
    Body: Buffer.from(imageBuffer),
  });
  await promptTable.create({
    schema: dalleHistorySchema,
    item: { ...event, sort: `dalle#${Date.now()}`, image: key },
  });
}
