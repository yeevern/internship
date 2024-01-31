import { dedupe } from "./dedupe";

describe("dedupe function", () => {
  test("should remove duplicated elements from an array", () => {
    const inputArray = [1, 2, 3, 2, 4, 5, 6, 6, 7];
    const result = dedupe(inputArray);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("should handle an empty array", () => {
    const inputArray: number[] = [];
    const result = dedupe(inputArray);
    expect(result).toEqual([]);
  });

  test("should handle an array with no duplicates", () => {
    const inputArray = [1, 2, 3, 4, 5];
    const result = dedupe(inputArray);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("should handle an array with all duplicates", () => {
    const inputArray = [1, 1, 1, 1, 1];
    const result = dedupe(inputArray);
    expect(result).toEqual([1]);
  });
});
