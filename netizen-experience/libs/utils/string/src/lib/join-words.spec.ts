import { joinWords } from "./join-words";

describe("joinWords", () => {
  test("should handle an empty array", () => {
    const wordsArray: string[] = [];
    const lastItemTerms = { singular: "item", plural: "items" };

    const result = joinWords(wordsArray, lastItemTerms);

    expect(result).toBe("");
  });

  test("should handle a single-word array", () => {
    const wordsArray = ["apple"];
    const lastItemTerms = { singular: "fruit", plural: "fruits" };

    const result = joinWords(wordsArray, lastItemTerms);

    expect(result).toBe("apple");
  });

  test('should join words with "and" when there are only two words', () => {
    const wordsArray = ["apple", "orange"];
    const lastItemTerms = { singular: "fruit", plural: "fruits" };

    const result = joinWords(wordsArray, lastItemTerms);

    expect(result).toBe("apple and orange");
  });

  test('should join words with commas and "and" when there are more than two words', () => {
    const wordsArray = ["apple", "orange", "banana", "grape"];
    const lastItemTerms = { singular: "fruit", plural: "fruits" };

    const result = joinWords(wordsArray, lastItemTerms);

    expect(result).toBe("apple, orange and 2 fruits");
  });

  test('should handle a custom number of individual items before "and"', () => {
    const wordsArray = ["apple", "orange", "banana", "grape"];
    const lastItemTerms = { singular: "fruit", plural: "fruits" };

    const result = joinWords(wordsArray, lastItemTerms, 3);

    expect(result).toBe("apple, orange, banana and 1 fruit");
  });

  test("should handle a custom number of individual items equal to array length", () => {
    const wordsArray = ["apple", "orange", "banana", "grape"];
    const lastItemTerms = { singular: "fruit", plural: "fruits" };

    const result = joinWords(wordsArray, lastItemTerms, 6);

    expect(result).toBe("apple, orange, banana and grape");
  });
});
