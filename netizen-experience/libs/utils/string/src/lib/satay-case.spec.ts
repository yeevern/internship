import { satayCase } from "./satay-case";

describe("satayCase", () => {
  test("should convert string to kebab case", () => {
    const result = satayCase("Hello World");

    expect(result).toBe("hello-world");
  });

  test("should handle leading/trailing spaces", () => {
    const result = satayCase("  Test String  ");

    expect(result).toBe("test-string");
  });

  test("should handle special characters", () => {
    const result = satayCase("This#is_a@special*string");

    expect(result).toBe("this-is-a-special-string");
  });

  test("should handle consecutive dashes", () => {
    const result = satayCase("a--b---c");

    expect(result).toBe("a-b-c");
  });
});
