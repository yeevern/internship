"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@netizen/ui";
import { Chip } from "@netizen/ui/server";

interface AccordionItem {
  id: string;
  questionIndex: number;
  question: string;
  type: string;
  attributes: Record<string, string>;
}

export function QuestionAccordions({ items }: { items: AccordionItem[] }) {
  return (
    <Accordion type="multiple">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="group hover:no-underline">
            <p className="flex items-baseline space-x-4">
              <span className="group-hover:underline">
                {item.questionIndex + 1}) {item.question}
              </span>
              <Chip size="sm">{item.type}</Chip>
            </p>
          </AccordionTrigger>
          <AccordionContent>
            <dl className="w-2/3 space-y-1">
              {Object.entries(item.attributes).map(([key, value]) => (
                <div key={key} className="grid grid-cols-4">
                  <dt className="">{key}:</dt>
                  <dd className="col-span-3">{value}</dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
