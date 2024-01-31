/**
 * Join an array of words into a grammatically correct sentence.
 *
 * @param words - An array of words to be joined.
 * @param lastItemTerms - An object containing the terms for the last item in the list.
 * @param lastItemTerms.singular - The singular term for the last item (e.g., "item").
 * @param lastItemTerms.plural - The plural term for the last item (e.g., "items").
 * @param maxIndividualItems - The maximum number of items to be displayed individually before using the conjunction.
 *
 * @returns - The joined sentence.
 *
 * @example
 * const wordsArray = ['apple', 'orange'];
 * const lastItemTerms = { singular: 'fruit', plural: 'fruits' };
 * const result = joinWords(wordsArray, lastItemTerms); // Output: "apple and orange"
 *
 * @example
 * const wordsArray = ['apple', 'orange', 'banana', 'grape'];
 * const lastItemTerms = { singular: 'fruit', plural: 'fruits' };
 * const result = joinWords(wordsArray, lastItemTerms, 2); // Output: "apple, orange and 2 fruits"
 */
export function joinWords(
  words: string[],
  lastItemTerms: { singular: string; plural: string },
  maxIndividualItems = 2,
) {
  if (words.length === 0) return "";
  if (words.length <= 2) return words.join(" and ");
  if (words.length > 2 && words.length <= maxIndividualItems)
    return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
  return `${words.slice(0, maxIndividualItems).join(", ")} and ${words.length - maxIndividualItems} ${
    words.length - maxIndividualItems > 1 ? lastItemTerms.plural : lastItemTerms.singular
  }`;
}
