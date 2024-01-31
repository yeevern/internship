import { useMemo, useState } from "react";

interface UseBooleanCallbacks {
  on: () => void;
  off: () => void;
  toggle: () => void;
  set: (value: boolean) => void;
}

type UseBooleanReturn = [boolean, UseBooleanCallbacks];

/**
 * Custom hook for managing a boolean state along with callback functions to manipulate the state.
 *
 * @param {boolean} [initialState=false] - The initial state of the boolean.
 * @returns {[boolean, UseBooleanCallbacks]} - A tuple containing the boolean state and callback functions.
 *
 * @typedef {Object} UseBooleanCallbacks
 * @property {() => void} on - Callback to set the boolean state to true.
 * @property {() => void} off - Callback to set the boolean state to false.
 * @property {() => void} toggle - Callback to toggle the boolean state (from true to false or vice versa).
 *
 * @example
 * const [isActive, { on, off, toggle }] = useBoolean(true);
 */
export function useBoolean(initialState = false): UseBooleanReturn {
  const [state, setState] = useState(initialState);
  const callbacks = useMemo(
    () => ({
      on: () => setState(true),
      off: () => setState(false),
      toggle: () => setState((prev) => !prev),
      set: (value: boolean) => setState(value),
    }),
    [],
  );
  return [state, callbacks];
}
