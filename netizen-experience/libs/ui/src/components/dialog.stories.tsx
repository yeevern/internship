import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  render: (props) => (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button variant="secondary">Get referral link</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Referral</DialogTitle>
          <DialogDescription>
            Share your referral link and earn credits when your friends complete a project!
          </DialogDescription>
        </DialogHeader>
        <Input readOnly value="https://bit.ly/98K8eH" />
        <DialogFooter>
          <Button
            onClick={() => {
              navigator.clipboard.writeText("https://bit.ly/98K8eH");
            }}
          >
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
