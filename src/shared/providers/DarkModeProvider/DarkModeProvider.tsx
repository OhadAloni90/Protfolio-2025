import React, { createContext, useReducer, useContext, ReactNode } from "react";

interface GlobalState {
  darkMode: boolean;
  marioMode: boolean;
  gameStarted: boolean;
  instructionApproved: boolean;
  loading: boolean;
  lockCameraOnHead: boolean;
  playMusic: boolean;
  showCv: boolean;
}

type GlobalAction =
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_MARIO_MODE" }
  | { type: "SET_GAME_STARTED" }
  | { type: "INSTRUCTION_APPROVED" }
  | { type: "LOCK_CAMERA_ON_HEAD" }
  | { type: "UNLOCK_CAMERA" } |
  {type: "PLAY_MUSIC"} | 
  {type: "ON_SHOW_CV"}
  | { type: "SET_LOADING"; payload: boolean };

const initialGlobalState: GlobalState = {
  darkMode: false,
  marioMode: false,
  gameStarted: false,
  instructionApproved: false,
  lockCameraOnHead: false,
  loading: true, // Initially loading
  playMusic: true,
  showCv: false
};

const GlobalContext = createContext<
  | {
      state: GlobalState;
      dispatch: React.Dispatch<GlobalAction>;
    }
  | undefined
>(undefined);

function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "SET_MARIO_MODE":
      return { ...state, marioMode: !state.marioMode };
    case "SET_GAME_STARTED":
      return { ...state, gameStarted: !state.gameStarted };
    case "INSTRUCTION_APPROVED":
      return { ...state, instructionApproved: !state.instructionApproved };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
      case 'PLAY_MUSIC':
        return {...state, playMusic: !state.playMusic };
    case "LOCK_CAMERA_ON_HEAD":
      return { ...state, lockCameraOnHead: true, marioMode: false };
    case "UNLOCK_CAMERA":
      return { ...state, lockCameraOnHead: false };
    case 'ON_SHOW_CV': 
    return { ... state, showCv: !state.showCv};
    default:
      return state;
  }
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(globalReducer, initialGlobalState);
  return <GlobalContext.Provider value={{ state, dispatch }}>{children}</GlobalContext.Provider>;
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
