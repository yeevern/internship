import { Heart } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/Card 🚧",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: (props) => (
    <Card className="max-w-sm" {...props}>
      <CardHeader>
        <CardTitle>Missing</CardTitle>
      </CardHeader>
      <CardContent>
        <img src="/pakalu.png" alt="missing person" className="aspect-square rounded-md" />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="secondary">
          <span>you so much</span>
          <Heart weight="fill" color="#ed1d24" />
        </Button>
      </CardFooter>
    </Card>
  ),
};
