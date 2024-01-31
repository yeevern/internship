import { Preview } from "@storybook/react";
import "./styles.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on.*" },
    controls: { sort: "requiredFirst" },
  },
};

export default preview;
