// import { invokeSettingsGet } from "@netizen/cloud-core/invoker";
// import { CareerConfigs, CareerSettings } from "@netizen/cloud-core/types/career";
import { CareerConfigs, CareerSettings } from "./lib";
// import schema from "./schema/settings.json";
import * as env from "@netizen/utils-env";

export async function getCareerConfigs(): Promise<CareerConfigs> {
  const table = env.getEnvironmentValue("TABLE_CAREER_LOGS");
  const bucket = env.getEnvironmentValue("BUCKET_CAREER");
  let settings: CareerSettings = {
    maxFileSizeInMB: 4,
    message: {
      greeting:
        "GET to this endpoint with 'email' query parameter to receive further instructions. Please provide the same email as the one used in your job application.",
      instruction:
        "POST to this endpoint with 'name', 'email' and 'file' parameters. This REST endpoint only accepts JSON format as the request body. The 'file' parameter should contain your resume PDF that is encoded in Base64 string, and the file size shouldn't be larger than 4MB.",
      submitted: "We have received your submission, thank you! Our team will get back to you in 3-5 working days.",
    },
  };
  // try {
  //   const careerSettingsObject = await invokeSettingsGet<CareerSettings>({
  //     name: "career",
  //     default: { schema, settings },
  //   });
  //   settings = careerSettingsObject.settings;
  // } catch (ex) {
  //   console.error(ex);
  // }
  console.log({ table, bucket, settings });
  return { table, bucket, settings };
}
