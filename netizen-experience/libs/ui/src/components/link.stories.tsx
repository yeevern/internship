import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    href: "https://bit.ly/98K8eH",
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Basic: Story = {
  render: (props) => <Link {...props}>Not a malicious link 💩</Link>,
};

export const NewTab: Story = {
  render: (props) => <Link {...props}>Not a malicious link 💩</Link>,
  args: {
    newTab: true,
  },
};
