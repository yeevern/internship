import { BaseError } from "@netizen/utils-types";

export type ServerActionState<StateType> =
  | ServerActionInitialState
  | ServerActionSuccess<StateType>
  | ServerActionError;

export interface ServerActionInitialState {
  success: undefined;
}

export interface ServerActionSuccess<StateType> {
  success: true;
  data: StateType;
}

export interface ServerActionError {
  success: false;
  error: {
    message: string;
  };
}

export function updateServerActionSuccessState<StateType>(state: ServerActionState<StateType>, data: StateType) {
  state.success = true;
  if (state.success) state.data = data;
}

export function updateServerActionFailedState<StateType>(state: ServerActionState<StateType>, error: BaseError) {
  state.success = false;
  if (state.success === false) state.error = { message: error.message };
}

export function handleServerActionError<StateType, ErrorType>(state: ServerActionState<StateType>, error: ErrorType) {
  if (error instanceof Error) updateServerActionFailedState(state, error);
  else {
    // @TODO: Need a better way to handle error which is not typeof Error
    console.error(error);
    updateServerActionFailedState(state, new Error("Unknown error"));
  }
}

export function windowIsDefined<ReturnType>(fnc: (value: typeof window | undefined) => ReturnType) {
  if (typeof window !== "undefined") return fnc(window);
  else return fnc(undefined);
}

export function toLocalDateTimeString(date: Date) {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
