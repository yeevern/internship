import { permanentRedirect } from "next/navigation";

export default function Settings() {
  permanentRedirect("/settings/account");
}
