/**
 * Converts string to kebab case (satay is the Malaysian kebab).
 *
 * @param name The string to convert.
 * @returns Returns the kebab cased string.
 */
export function satayCase(name: string) {
  return name.trim().toLowerCase().replace(/[\W_]/g, "-").replace(/--+/g, "-");
}
