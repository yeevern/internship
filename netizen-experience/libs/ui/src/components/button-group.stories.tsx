import { Bank, Bell, DotsThreeVertical, Globe, Heart, ShareFat, UsersThree, Warning } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup, ButtonGroupIconItem, ButtonGroupItem } from "./button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/Button Group",
  component: ButtonGroup,
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "secondary", "danger", "ghost"],
      table: {
        defaultValue: { summary: "secondary" },
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      table: {
        defaultValue: { summary: "md" },
      },
    },
  },
  args: {
    variant: "secondary",
    size: "md",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const ButtonGroupStory: Story = {
  name: "Button Group",
  render: (props) => (
    <ButtonGroup {...props}>
      <ButtonGroupItem>Edit project</ButtonGroupItem>
      <ButtonGroupItem>Export data</ButtonGroupItem>
    </ButtonGroup>
  ),
};

export const IconButtonGroup: Story = {
  render: (props) => (
    <ButtonGroup {...props}>
      <ButtonGroupIconItem>
        <Heart />
      </ButtonGroupIconItem>
      <ButtonGroupIconItem>
        <ShareFat />
      </ButtonGroupIconItem>
      <ButtonGroupIconItem>
        <Bell />
      </ButtonGroupIconItem>
    </ButtonGroup>
  ),
};

export const WithDropdown: Story = {
  name: "Group with Dropdown Menu",
  render: (props) => (
    <ButtonGroup {...props}>
      <ButtonGroupItem>
        <Heart />
        <span>Send love</span>
      </ButtonGroupItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ButtonGroupIconItem>
            <DotsThreeVertical />
          </ButtonGroupIconItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuLabel>Select method of conflict resolution</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <DropdownMenuItemIcon>
              <UsersThree />
            </DropdownMenuItemIcon>
            <span>Send troops</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DropdownMenuItemIcon>
              <Bank />
            </DropdownMenuItemIcon>
            <span>Impose sanctions</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DropdownMenuItemIcon>
              <Globe />
            </DropdownMenuItemIcon>
            <span>Talk to UN</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-danger-foreground">
            <DropdownMenuItemIcon>
              <Warning />
            </DropdownMenuItemIcon>
            <span>Nuke them!</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
};
