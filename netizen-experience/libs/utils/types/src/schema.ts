import { UUID } from "crypto";
import { isValid } from "date-fns";
import { z } from "zod";
import { isUuid } from "./predicates";
import { Join } from "./types";

/**
 * Zod schema for UUID
 */
export const uuidSchema = z.custom<UUID>((arg) => typeof arg === "string" && isUuid(arg));

/**
 * Creates a zod schema using prefixes and an optional predicate.
 * @param params.prefixes - An array of string prefixes that the input string should start with. Must use with `as const` to obtain the proper types.
 * @param params.predicate - An optional predicate function to further refine the remaining string after stripping the prefixes.
 * @returns The custom zod schema.
 *
 * @example
 * const schema = prefixedKeySchema({
 *   prefixes: ['A1', 'B2'] as const,
 *   predicate: (arg): arg is `${string}0` => arg.endsWith("0")
 * });
 *
 * const result = schema.parse('A1#B2#value0');
 * // `result` should have the string literal type `A1#B2#${string}0`
 */
export const prefixedKeySchema = <Prefixes extends string[], Value extends string = string>(
  params:
    | Prefixes
    | {
        prefixes: Prefixes;
        predicate: (arg: string) => arg is Value;
      },
) =>
  z.custom<Join<[...Prefixes, Value], "#">>((arg) => {
    if (typeof arg !== "string") return false;

    let prefixes: Prefixes;
    let predicate: ((arg: string) => arg is Value) | undefined;
    if (Array.isArray(params)) {
      prefixes = params;
    } else {
      prefixes = params.prefixes;
      predicate = params.predicate;
    }
    const keyStrings = arg.split("#");
    const remainingString = keyStrings.slice(prefixes.length).join("#");

    if (keyStrings.length <= prefixes.length) return false;
    return prefixes.every((prefix, i) => prefix === keyStrings[i]) && (!predicate || predicate(remainingString));
  });

export const prefixedTimestampSchema = <Prefixes extends string[]>(prefixes: Prefixes) =>
  prefixedKeySchema({
    prefixes,
    predicate: (timestamp): timestamp is `${number}` => isValid(parseInt(timestamp)),
  });
