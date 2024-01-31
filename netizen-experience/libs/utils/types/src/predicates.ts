import type { UUID } from "crypto";

export function isTypeOf<OutputType, PredicateArgType = OutputType>(
  arg: unknown,
  predicate: (arg: PredicateArgType) => boolean,
): arg is OutputType {
  return predicate(arg as PredicateArgType);
}

export function isUuid(value: string): value is UUID {
  return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gm.exec(value) !== null;
}

export function ensureNotNull<Type>(value: Type | null): Type {
  if (value === null) throw new Error("Type - Value is null");
  return value;
}
