import { PropsWithChildren } from "react";
import { Link } from "@netizen/ui/server";

export default function GPT4Layout({ children }: PropsWithChildren) {
  return (
    <>
      <div className="flex basis-1/6">
        <Link href="/prompthub/gpt-4">New GPT-4 Chat</Link> | <Link href="/prompthub/gpt-4/chat">Chat History</Link>
      </div>
      <div className="flex basis-5/6">{children}</div>
    </>
  );
}
