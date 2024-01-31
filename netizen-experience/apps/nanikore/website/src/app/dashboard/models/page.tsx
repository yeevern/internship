import { Heading } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import CreateModel from "./create-model";
import Models from "./models";

export default async function ModelManagement() {
  await authCheck([RIGHTS.ADMIN]);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading className="flex-1 font-bold">Models</Heading>
        <CreateModel />
      </div>
      <Models />
    </>
  );
}
