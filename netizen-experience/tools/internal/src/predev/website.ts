import * as path from "path";
import { updateEnvFile } from "../utils/envUpdater";

const defaultEnvValues = {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "65644825762-bpc77rns3p1uma5id1rrih6a7ot44efc.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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",
  JWE_SECRET: "kXz17ETXNRQmr/qoN3oe3hz+NY8EccqYd88u2X+0K+I=",
  DYNAMO_PROMPT: "nx-internal-prompt-local-prompt0BBE340F-1K30SUZL53GXM",
  DYNAMO_USER: "nx-internal-user-local-user2C2B57AE-LZNMENV9TXC4",
  S3_PROMPT: "nx-internal-prompt-local-images9bf4dcd5-bpqa6s6nv828",
  LAMBDA_DALLE_SAVE_HISTORY: "nx-internal-prompt-local-dalleSaveHistory1EB41FFD-1go4m4UnAFUJ",
  OPENAI_API_KEY: "YOUR_OPEN_API_KEY",
};

updateEnvFile(path.join(process.cwd(), ".env"), defaultEnvValues);
