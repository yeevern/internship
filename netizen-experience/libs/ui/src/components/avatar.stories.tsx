import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Static: Story = {
  render: (props) => (
    <Avatar {...props}>
      <AvatarImage src="/pakalu.png" />
      <AvatarFallback>PP</AvatarFallback>
    </Avatar>
  ),
};

export const Animated: Story = {
  render: (props) => (
    <Avatar {...props}>
      <AvatarImage src="/shaquille.gif" />
      <AvatarFallback>SON</AvatarFallback>
    </Avatar>
  ),
};

export const Initials: Story = {
  render: (props) => (
    <Avatar {...props}>
      <AvatarFallback>PP</AvatarFallback>
    </Avatar>
  ),
};
