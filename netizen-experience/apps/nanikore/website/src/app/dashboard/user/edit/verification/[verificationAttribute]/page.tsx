import { authCheck } from "@/auth";
import VerificationForm from "./VerificationForm";

export default async function Page({ params }: { params: { verificationAttribute: string } }) {
  const auth = await authCheck();

  return (
    <VerificationForm
      accessToken={auth.serverSession.accessToken}
      verificationAttribute={params.verificationAttribute}
    />
  );
}
