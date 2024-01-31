import * as path from "path";
import { updateEnvFile } from "../utils/envUpdater";
const cognitoUserPoolClientId = "7s3nb2hmavva4iqtmv671rhans";
const cognitoHostedUiUrl = "https://nx-nanikore-user-local-oauth.auth.ap-southeast-1.amazoncognito.com";
const cognitoSignoutUrl = "http://localhost:3000/auth/signout";

const defaultEnvValues = {
  AWS_REGION: "ap-southeast-1",
  COGNITO_CLIENT_ID: cognitoUserPoolClientId,
  COGNITO_CLIENT_SECRET: "ktkjv0ujvlkc4adf5artl0j59f5s169mk98pvqcj5hh5iunnqrn",
  COGNITO_USERPOOL_ID: "ap-southeast-1_LuNU5WvTD",
  /** @deprecated */ DYNAMO_EVENTS: "nx-nanikore-event-local-events26E65764-1T61GO1G84GY8",
  DYNAMO_PROJECTS: "nx-nanikore-project-local-projects9614A9BB-M7ZV2IWJMMZ9",
  /** @deprecated */ DYNAMO_SURVEY: "nx-nanikore-survey-local-surveys316D7D9E-ZG34JFXAH94Z",
  /** @deprecated */ DYNAMO_SURVEY_ENTRIES: "nx-nanikore-survey-local-entriesE4485EC2-1PUAPI3VAKF90",
  /** @deprecated */ DYNAMO_SURVEY_MODEL: "nx-nanikore-survey-local-models3A8DAD06-LQH0ZDCHIOF6",
  DYNAMO_CHIME: "nx-nanikore-chime-local-chimeA0D27F2C-UN0PI0HZV9QK",
  DYNAMO_SURVEY_MODELS: "nx-nanikore-survey-local-models3A8DAD06-LQH0ZDCHIOF6",
  DYNAMO_SURVEYS: "nx-nanikore-survey-local-surveys316D7D9E-BAHG5XVVEKTR",
  DYNAMO_PROFILES: "nx-nanikore-user-local-profilesFC7986CD-1EIFV2OY4KUO1",
  DYNAMO_TRANSANCTIONS: "nx-nanikore-user-local-transactions8A3A51B2-O2A7ZTFGH7JR",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "Gr3SC/t1SCP8KyMDsh++WppQTObliV/pUa+rOviGRN8=",
  NEXT_PUBLIC_COGNITO_SIGNOUT_URL: `${cognitoHostedUiUrl}/logout?client_id=${cognitoUserPoolClientId}&logout_uri=${cognitoSignoutUrl}`,
};

updateEnvFile(path.join(process.cwd(), ".env"), defaultEnvValues);
