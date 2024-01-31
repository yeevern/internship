import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./heading";
import { InlineCode } from "./inline-code";
import { Subheading } from "./subheading";

const meta: Meta<typeof InlineCode> = {
  title: "Design System/Typography",
  tags: ["autodocs"],
};

export default meta;

export const Examples: StoryObj = {
  render: () => (
    <>
      <Heading className="font-black">gr8 b8 m8</Heading>
      <Subheading className="font-bold">i rel8 str8 appreci8 and congratul8</Subheading>
      <p className="mt-4">
        i r8 dis b8 an 8/8. plz no h8, i'm str8 ir8. cr8 more cant w8. we shood convers8 i wont ber8, my number is{" "}
        <InlineCode className="text-emerald">8888888</InlineCode> ask for N8. no calls l8 or out of st8. if on a d8, ask
        K8 to loc8. even with a full pl8 i always hav time to communic8 so dont hesit8. dont forget to medit8 and
        particip8 and masturb8 to allevi8 ur ability to tabul8 the f8. we should meet up m8 and convers8 on how we can
        cre8 more gr8 b8, im sure everyone would appreci8 no h8. i dont mean to defl8 ur hopes, but itz hard to dict8
        where the b8 will rel8 and we may end up with out being appreci8d, im sure u can rel8. we can cre8 b8 like{" "}
        <InlineCode>alexander</InlineCode> the gr8, stretch posts longer than the nile's str8s. well be the captains of
        b8 <InlineCode className="text-danger-foreground">4chan</InlineCode> our first m8s the growth r8 will spread to{" "}
        <InlineCode className="text-pizazz">reddit</InlineCode> and like reel est8 and be a flow r8 of gr8 b8 like a
        blind d8 well coll8 meet me upst8 where we can convers8 or ice sk8 or lose w8 infl8 our hot air baloons and fly
        tail g8. we cood land in kuw8, eat a soup pl8 followed by a dessert pl8 the payment r8 wont be too ir8 and
        hopefully our currency wont defl8. well head to the <InlineCode>israeli-St8</InlineCode>, taker over like{" "}
        <InlineCode>herod</InlineCode> the gr8 and b8 the <InlineCode>jewish</InlineCode> masses 8 million m8. we could
        interrel8 communism thought it's past it's maturity d8, a department of st8 volunteer st8. reduce the infant
        mortality r8, all in the name of making gr8 b8 m8.
      </p>
    </>
  ),
};
