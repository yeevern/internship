import Link from "next/link";
import { Button } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "../../../auth";

export default async function Page() {
  const auth = await authCheck();

  return (
    <>
      <img src={auth.user.picture} alt={auth.user.name} />
      <div>{auth.user.rights.includes(RIGHTS.ADMIN) ? "Admin" : "User"}</div>
      <div>Name: {auth.user.name}</div>
      <div>Email: {auth.user.email}</div>
      <div>Phone: {auth.user.phone}</div>
      <hr />
      <Button asChild>
        <Link href="/dashboard/user/edit">Edit Profile</Link>
      </Button>
    </>
  );
}
