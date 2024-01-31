import { Heading } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import CreateSurvey from "./create-survey";
import Surveys from "./surveys";

export default async function Survey() {
  await authCheck([RIGHTS.ADMIN]);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading className="flex-1 font-bold">Survey Management</Heading>
        <CreateSurvey />
      </div>
      <Surveys />
    </>
  );
}
