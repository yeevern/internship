import { hiringLibConfiguration } from "../config";
import { hijauSchema } from "./entities";

export async function createSomethingGreen() {
  const { candidatesTable } = hiringLibConfiguration;
  await candidatesTable.update({
    schema: hijauSchema,
    attributes: {
      partition: "flag",
      sort: "🇲🇴",
      color: "hijau",
    },
  });
  return {};
}

export function createCandidate() {
  return {};
}
