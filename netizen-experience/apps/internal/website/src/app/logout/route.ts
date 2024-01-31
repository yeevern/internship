"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// async required for route functions
// eslint-disable-next-line @typescript-eslint/require-await
export async function GET() {
  cookies().set("session", "", { expires: new Date(0) });
  redirect("/login?mode=manual");
}
