import React, { createContext, useReducer, useContext, ReactNode } from "react";

type State = { darkMode: boolean };
type Action = { type: "TOGGLE_DARK_MODE" };
type Dispatch = (action: Action) => void;

const initialState: State = { darkMode: false };

const DarkModeContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function darkModeReducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_DARK_MODE":
      return { darkMode: !state.darkMode };
    default:
      return state;
  }
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(darkModeReducer, initialState);
  return (
    <DarkModeContext.Provider value={{ state, dispatch }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};
