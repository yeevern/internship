import { authCheck } from "../../../../auth";
import EditForm from "./EditForm";

export default async function Page() {
  const auth = await authCheck();
  const user = auth.user;
  return <EditForm user={user} accessToken={auth.serverSession.accessToken} />;
}
