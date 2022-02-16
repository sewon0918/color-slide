import React, { useReducer, createContext, Dispatch, useContext } from "react";

// 상태를 위한 타입
type State = {
  red: number;
  green: number;
  blue: number;
  color: number; //바뀌고있는 색깔(0:red, 1:green, 2:blue)
  changing: boolean;
};

// 모든 액션들을 위한 타입
type Action =
  | { type: "SET_RED"; red: number }
  | { type: "SET_GREEN"; green: number }
  | { type: "SET_BLUE"; blue: number }
  | { type: "SET_COLOR"; color: number }
  | { type: "SET_CHANGING"; changing: boolean };

const initialState = {
  red: 127,
  green: 127,
  blue: 127,
  color: 0,
  changing: false,
};

type ColorDispatch = Dispatch<Action>;

const ColorStateContext = createContext<State>(initialState);
const ColorDispatchContext = createContext<ColorDispatch>(() => null);

function colorReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_RED":
      return {
        ...state,
        red: action.red,
      };
    case "SET_GREEN":
      return {
        ...state,
        green: action.green,
      };
    case "SET_BLUE":
      return {
        ...state,
        blue: action.blue,
      };
    case "SET_COLOR":
      return {
        ...state,
        color: action.color,
      };
    case "SET_CHANGING":
      return {
        ...state,
        changing: action.changing,
      };
    default:
      throw new Error("Unhandled action");
  }
}

function ColorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(colorReducer, initialState);

  return (
    <ColorStateContext.Provider value={state}>
      <ColorDispatchContext.Provider value={dispatch}>
        {children}
      </ColorDispatchContext.Provider>
    </ColorStateContext.Provider>
  );
}
// state 와 dispatch 를 쉽게 사용하기 위한 커스텀 Hooks
function useColorState() {
  const state = useContext(ColorStateContext);
  if (!state) throw new Error("Cannot find ColorProvider"); // 유효하지 않을땐 에러를 발생
  return state;
}

function useColorDispatch() {
  const dispatch = useContext(ColorDispatchContext);
  if (!dispatch) throw new Error("Cannot find ColorProvider"); // 유효하지 않을땐 에러를 발생
  return dispatch;
}

export { ColorProvider, useColorState, useColorDispatch };
