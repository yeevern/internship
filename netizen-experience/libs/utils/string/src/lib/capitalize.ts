/**
 * Capitalizes the first character of `string`.
 *
 * @param string The string to capitalize.
 * @returns Returns the capitalized string.
 */
export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
