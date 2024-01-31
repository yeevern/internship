import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      type: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Basic: Story = {
  render: (props) => <Switch {...props} />,
};
