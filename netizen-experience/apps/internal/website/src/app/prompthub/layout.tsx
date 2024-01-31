import { PropsWithChildren } from "react";
import { Link } from "@netizen/ui/server";
import { checkSession } from "@/googleAuth/session";

export default async function PromptLayout({ children }: PropsWithChildren) {
  let canView = false;
  try {
    await checkSession(["prompt"]);
    canView = true;
  } catch (ex) {
    // @TODO: Thinking do we need to log this? There might be too many of these.
  }
  return (
    <main className="container flex h-screen flex-col py-8">
      <h1 className="mb-4 text-2xl font-bold">Prompt Hub</h1>
      {canView ? (
        <>
          <div className="flex flex-row">
            <Link href="/prompthub/dall-e">Dall-E</Link> | <Link href="/prompthub/gpt-4">GPT-4</Link> |
            <Link href="/prompthub/gpt-assistant">GPT Assistant</Link>
          </div>
          <div className="flex h-full w-full flex-row">{children}</div>
        </>
      ) : (
        <p>You do not have permission to view this page.</p>
      )}
    </main>
  );
}
