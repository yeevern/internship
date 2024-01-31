import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "../../../auth";

export default async function EventLayout({
  admin,
  respondent,
}: {
  admin: React.ReactNode;
  respondent: React.ReactNode;
}) {
  const { user } = await authCheck();
  // eslint-disable-next-line react/jsx-no-useless-fragment -- Fragment is required as the return value is a Promise. Reference: https://github.com/vercel/next.js/issues/49280#issuecomment-1536915621
  return <>{user.rights.includes(RIGHTS.ADMIN) ? admin : respondent}</>;
}
