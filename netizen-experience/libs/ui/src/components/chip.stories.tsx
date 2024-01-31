import { Asterisk } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./chip";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Basic: Story = {
  render: (props) => <Chip {...props}>Chip</Chip>,
};

export const WithIcon: Story = {
  name: "With Icon 🚧",
  render: (props) => (
    <Chip {...props}>
      <Asterisk className="mr-1" />
      Chip
    </Chip>
  ),
};
