import { capitalize } from "./capitalize";

describe("capitalize", () => {
  test("capitalizes the first character of a string", () => {
    const input = "hello";
    const result = capitalize(input);
    expect(result).toBe("Hello");
  });

  test("handles an empty string", () => {
    const input = "";
    const result = capitalize(input);
    expect(result).toBe("");
  });

  test("handles a string with only one character", () => {
    const input = "a";
    const result = capitalize(input);
    expect(result).toBe("A");
  });

  test("does not modify an already capitalized string", () => {
    const input = "Hello";
    const result = capitalize(input);
    expect(result).toBe("Hello");
  });

  test("capitalizes only the first character in a sentence", () => {
    const input = "this is a test sentence.";
    const result = capitalize(input);
    expect(result).toBe("This is a test sentence.");
  });
});
