/**
 * Remove duplicated elements from an array.
 * @param array Array to be processed.
 * @returns Deduped array.
 */
export function dedupe<T>(array: T[]) {
  return Array.from(new Set(array));
}
