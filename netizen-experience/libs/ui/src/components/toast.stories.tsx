import { Coffee } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Toaster, toast } from "./toast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster 🚧",
  component: Toaster,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Basic: Story = {
  render: (props) => (
    <>
      <Button
        onClick={() =>
          toast("Your toast is ready!", {
            description: "Coffee will be served in 5 minutes.",
            cancel: { label: "Eat 🍞" },
          })
        }
      >
        <span>Make toast</span>
        <Coffee />
      </Button>
      <Toaster {...props} />
    </>
  ),
};

// @TODO: add more props to control toasts
