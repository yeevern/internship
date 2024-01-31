import { getDalleHistory } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";
import { toLocalDateTimeString } from "@/utils/types";

export default async function DalleHistoryDetails({ params: { promptId } }: { params: { promptId: string } }) {
  const session = await checkSession(["prompt"]);
  const item = await getDalleHistory({ id: session.id, promptId: parseInt(promptId) });
  return (
    <div>
      <p>Prompted At:</p>
      <p>{toLocalDateTimeString(new Date(parseInt(promptId)))}</p>
      <p>Prompt</p>
      <p>{item.prompt}</p>
      <p>Revised Prompt</p>
      <p>{item.openAiResponse.revisedPrompt}</p>
      <p>Image</p>
      <img src={item.url} alt={item.openAiResponse.revisedPrompt} />
      <p>Image generation Params</p>
      <p>Quality</p>
      <p>{item.imageGenerationParams.quality}</p>
      <p>Style</p>
      <p>{item.imageGenerationParams.style}</p>
    </div>
  );
}
