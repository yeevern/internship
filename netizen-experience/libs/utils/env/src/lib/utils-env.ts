/**
 * Get environment value from process.env and throw error if not found.
 * @param key - The key to get the value from process.env
 * @returns The value from process.env
 */

export function getEnvironmentValue(key: string): string {
  const value = process.env[key];
  if (value === undefined) throw Error(`Environment - Cannot get value with key: ${key} `);
  return value;
}
