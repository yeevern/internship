import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Chip } from "./chip";
import { DescriptionList, DescriptionListDetails, DescriptionListItem, DescriptionListTerm } from "./description-list";

const meta: Meta<typeof DescriptionList> = {
  title: "Components/Description List",
  component: DescriptionList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Basic: Story = {
  render: (props) => (
    <DescriptionList {...props}>
      <DescriptionListItem>
        <DescriptionListTerm>Moderator</DescriptionListTerm>
        <DescriptionListDetails className="inline-flex items-center">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/shaquille.gif" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          <span className="ml-2">Rachel</span>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Session mode</DescriptionListTerm>
        <DescriptionListDetails>Remote</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Device type</DescriptionListTerm>
        <DescriptionListDetails className="space-x-1">
          <Chip size="sm">Mobile</Chip>
          <Chip size="sm">Desktop</Chip>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Language</DescriptionListTerm>
        <DescriptionListDetails>English</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Interpreter language</DescriptionListTerm>
        <DescriptionListDetails>Manglish</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Incentive</DescriptionListTerm>
        <DescriptionListDetails>10 crystals</DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};
