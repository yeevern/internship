import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      options: [false, true, "indeterminate"],
    },
    disabled: { type: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  render: (props) => <Checkbox {...props} />,
};
