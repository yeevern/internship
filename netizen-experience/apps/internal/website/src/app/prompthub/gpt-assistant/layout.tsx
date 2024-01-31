import { PropsWithChildren } from "react";
import { Link } from "@netizen/ui/server";
import { checkSession } from "@/googleAuth/session";

export default async function PromptLayout({ children }: PropsWithChildren) {
  let canView = false;
  let isAdmin = false;
  try {
    await checkSession(["gptAssistant"]);
    canView = true;
    await checkSession(["gptAssistantAdmin"]);
    isAdmin = true;
  } catch (ex) {
    // @TODO: Thinking do we need to log this? There might be too many of these.
  }
  return canView ? (
    <>
      <div className="flex basis-1/6">
        <div>
          <h2>GPT Assistant</h2>
          <hr />
          <Link href="/prompthub/gpt-assistant">List</Link> |
          <Link href="/prompthub/gpt-assistant/history">History</Link>
          {isAdmin && (
            <>
              | <Link href="/prompthub/gpt-assistant/admin">Admin</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex basis-5/6">{children}</div>
    </>
  ) : (
    <p>You do not have permission to view this page.</p>
  );
}
