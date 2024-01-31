import { format } from "date-fns";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  Heading,
  InlineCode,
} from "@netizen/ui/server";
import { capitalize } from "@netizen/utils-string";
import { getModelById } from "@nanikore/libs-survey";
import { ModelActions } from "./model-actions";

export default async function ModelDetails({ params: { id } }: { params: { id: string } }) {
  const model = await getModelById(id);
  const details: { key: string; value: string; mono?: boolean }[] = [
    { key: "Last updated", value: format(model.updatedAt, "dd/MM/yyyy, h:mm:ss a") },
    { key: "Type", value: capitalize(model.type) },
  ];
  switch (model.type) {
    case "selection":
      details.push(
        { key: "Options", value: model.selections.join(", ") },
        { key: "Allow custom answer?", value: model.allowOthers ? "Yes" : "No" },
      );
      break;
    case "date":
      model.min &&
        model.max &&
        details.push({
          key: "Date range",
          value: `${format(model.min, "dd/MM/yyyy")} - ${format(model.max, "dd/MM/yyyy")}`,
        });
      break;
    case "number":
      model.min !== undefined && details.push({ key: "Min", value: model.min.toString() });
      model.max !== undefined && details.push({ key: "Max", value: model.max.toString() });
      break;
    case "string":
      model.regex && details.push({ key: "Regex", value: model.regex, mono: true });
      break;
    default:
      break;
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <header>
          <Heading className="flex-1 font-bold">{model.name}</Heading>
          {model.description && <p className="text-sm text-muted-foreground">{model.description}</p>}
        </header>
        <ModelActions model={model} />
      </div>
      <section className="mt-4">
        <DescriptionList>
          {details.map(({ key, mono, value }) => (
            <DescriptionListItem key={key}>
              <DescriptionListTerm>{key}</DescriptionListTerm>
              <DescriptionListDetails>{mono ? <InlineCode>{value}</InlineCode> : value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
        </DescriptionList>
      </section>
    </>
  );
}
