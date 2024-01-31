import { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@netizen/ui/server";

export function SubmitButton({ children }: PropsWithChildren) {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-end">
      <Button type="submit" aria-disabled={pending}>
        {pending ? <p>¡¡¡!!!Loading¡¡¡!!!</p> : children}
      </Button>
    </div>
  );
}
