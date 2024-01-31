import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./table";

const meta: Meta<typeof Table> = {
  title: "Components/Table 🚧",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Basic: Story = {
  render: (props) => <Table {...props} />,
};
