import Link from "next/link";
import { Button } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { getSettings } from "../actions";

export default async function Page() {
  const { account } = await getSettings();

  return (
    <>
      <img src={account.picture} alt={account.name} />
      <div>{account.rights.includes(RIGHTS.ADMIN) ? "Admin" : "User"}</div>
      <div>Name: {account.name}</div>
      <div>Email: {account.email}</div>
      <div>Phone: {account.phone}</div>
      <hr />
      <Button asChild>
        <Link href="/profile/account/edit">Edit Profile</Link>
      </Button>
    </>
  );
}
