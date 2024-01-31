import { Dispatch, PropsWithChildren, createContext, useContext, useReducer } from "react";

const AlertContext = createContext<Message[] | null>(null);
const AlertDispatchContext = createContext<Dispatch<Actions> | null>(null);

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (context === null) throw new Error("Alert context is null");
  return context;
}

export function useAlertDispatchContext() {
  const context = useContext(AlertDispatchContext);
  if (context === null) throw new Error("Alert dispatch context is null");
  return context;
}

interface Message {
  type: "success" | "danger" | "warning" | "info";
  message: string;
  id?: string;
  timout?: number;
}

interface AddAction {
  type: "add";
  id?: string;
  message: Message;
  timeout?: number;
}

interface RemoveByIndexAction {
  type: "remove";
  index: number;
}

interface RemoveByIdAction {
  type: "remove";
  id: string;
}

interface ClearAction {
  type: "clear";
}

type Actions = AddAction | ClearAction | RemoveByIndexAction | RemoveByIdAction;

export function AlertProvider({ children }: PropsWithChildren) {
  const [alerts, dispatch] = useReducer(alertReducer, []);
  return (
    <AlertContext.Provider value={alerts}>
      <AlertDispatchContext.Provider value={dispatch}>{children}</AlertDispatchContext.Provider>
    </AlertContext.Provider>
  );
}

function alertReducer(messages: Message[], action: Actions) {
  switch (action.type) {
    case "add": {
      return [...messages, action.message];
    }
    case "remove": {
      if ("id" in action) return messages.filter((m) => m.id !== action.id);
      else return messages.filter((_, i) => i !== action.index);
    }
    case "clear": {
      return [];
    }
    default: {
      throw Error("Unknown action");
    }
  }
}
