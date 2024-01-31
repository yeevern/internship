import { BaseError } from "@netizen/utils-types";

export type ServerActionState<StateType = never> =
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

export type ServerAction<State, Payload> = (
  state: ServerActionState<State>,
  payload: Payload,
) => ServerActionState<State> | Promise<ServerActionState<State>>;

export function updateServerActionSuccessState<StateType>(state: ServerActionState<StateType>, data: StateType) {
  state.success = true;
  if (state.success) state.data = data;
}

export function updateServerActionFailedState<StateType, ErrorType extends BaseError>(
  state: ServerActionState<StateType>,
  error: ErrorType,
) {
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
