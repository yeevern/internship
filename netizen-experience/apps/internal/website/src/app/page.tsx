"use client";

import { ChatCircleDots, Briefcase, SignOut } from "@phosphor-icons/react";
import { BentoGrid } from "@/components/bento-grid";
import { BentoGridItem } from "@/components/bento-grid-item";

export default function Internal() {
  return (
    <BentoGrid className="mx-auto max-w-4xl md:auto-rows-[20rem]">
      <BentoGridItem
        title="Prompt Hub"
        description="Ask questions, get answers."
        header={
          <div className="mt-24 flex justify-center">
            <ChatCircleDots size={300} />
          </div>
        }
        className="md:col-span-2 md:row-span-2"
        onClick={() => {
          window.open("/prompthub", "_blank");
        }}
      />
      <BentoGridItem
        title="Hiring"
        description="Come work with us!"
        header={
          <div className="mt-18 flex justify-center">
            <Briefcase size={100} />
          </div>
        }
        className="md:row-span-0.5 md:col-span-1"
        onClick={() => {
          window.open("/hiring", "_blank");
        }}
      />
      <BentoGridItem
        title="Logout"
        description="Logout of your account."
        header={
          <div className="mt-18 flex justify-center">
            <SignOut size={100} />
          </div>
        }
        className="md:row-span-0.5 bg-gradient-to-br from-neutral-200 to-neutral-100 md:col-span-1 dark:from-neutral-900 dark:to-neutral"
        onClick={() => {
          window.open("/logout", "_blank");
        }}
      />
    </BentoGrid>
  );
}
