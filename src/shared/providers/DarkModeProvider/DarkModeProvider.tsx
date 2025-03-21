import React, { createContext, useReducer, useContext, ReactNode } from "react";

interface GlobalState {
  darkMode: boolean;
  marioMode: boolean;
  gameStarted: boolean;
  instructionApproved: boolean;
}

type GlobalAction =
   { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_MARIO_MODE" }
  | { type: "SET_GAME_STARTED" } | 
  {type: 'INSTRUCTION_APPROVED'}

const initialGlobalState: GlobalState = {
  darkMode: false,
  marioMode: false,
  gameStarted: false,
  instructionApproved: false
};

const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
} | undefined>(undefined);

function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "SET_MARIO_MODE":
      return { ...state, marioMode: !state.marioMode };
    case "SET_GAME_STARTED":
      return { ...state, gameStarted: !state.gameStarted };
      case "INSTRUCTION_APPROVED":
        return {...state, instructionApproved: !state.instructionApproved }
    default:
      return state;
  }
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(globalReducer, initialGlobalState);
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
