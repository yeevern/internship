import { customAlphabet } from "nanoid";

/**
 * Generates a 12-digit random ID consisting of alphanumeric characters.
 *
 * @returns The randomly generated ID.
 */
export function randomId() {
  return customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)();
}
