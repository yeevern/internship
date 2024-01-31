import { PropsWithChildren } from "react";
import { Link } from "@netizen/ui/server";

export default function DalleLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div className="basis-1/6">
        <Link href="/prompthub/dall-e">Dall E</Link> | <Link href="/prompthub/dall-e/history">History</Link>
      </div>
      <div className="basis-5/6">{children}</div>
    </>
  );
}
