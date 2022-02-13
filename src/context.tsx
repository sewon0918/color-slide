import React, { useReducer, createContext, Dispatch, useContext } from "react";

// 상태를 위한 타입
type State = {
  red: number;
  green: number;
  blue: number;
};

// 모든 액션들을 위한 타입
type Action =
  | { type: "SET_RED"; red: number }
  | { type: "SET_GREEN"; green: number }
  | { type: "SET_BLUE"; blue: number };

const initialState = {
  red: 0,
  green: 0,
  blue: 0,
};

const ColorContext = createContext({
  red: 0,
  green: 0,
  blue: 0,
  setRed: (red: number) => {},
  setGreen: (green: number) => {},
  setBlue: (blue: number) => {},
});

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
    default:
      throw new Error("Unhandled action");
  }
}

function ColorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  //   function setRed(red: number) {
  //     dispatch({
  //       type: "SET_RED",
  //       red: red,
  //     });
  //   }
  //   function setGreen(green: number) {
  //     dispatch({
  //       type: "SET_GREEN",
  //       green: green,
  //     });
  //   }

  //   function setBlue(blue: number) {
  //     dispatch({
  //       type: "SET_BLUE",
  //       blue: blue,
  //     });
  //   }
  //   return (
  //     <ColorContext.Provider
  //       value={{
  //         red: state.red,
  //         green: state.green,
  //         blue: state.blue,
  //         setRed,
  //         setGreen,
  //         setBlue,
  //       }}
  //       {...children}
  //     />
  //   );
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
