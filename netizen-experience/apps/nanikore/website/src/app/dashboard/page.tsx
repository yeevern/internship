import Link from "next/link";
import { linkVariants } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";

export default async function Dashboard() {
  const { user } = await authCheck();
  const links = user.rights.includes(RIGHTS.ADMIN)
    ? [
        { path: "/dashboard/project", name: "Project" },
        { path: "/dashboard/models", name: "Models" },
        { path: "/dashboard/surveys", name: "Surveys" },
      ]
    : [{ path: "/dashboard/project", name: "Project" }];
  return (
    <ul className="list-inside list-disc">
      {links.map(({ name, path }) => (
        <li key={path}>
          <Link href={path} className={linkVariants()}>
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
