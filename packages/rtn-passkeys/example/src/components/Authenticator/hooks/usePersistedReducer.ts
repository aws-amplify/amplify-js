import { Reducer, useCallback, useReducer, useState } from "react";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export function usePersistedReducer<S extends JSONValue, A>(
  reducer: Reducer<S, A>,
  initialState: S
) {
  const [state, setState] = useState(initialState);

  const memoizedReducer = useCallback(
    (state: S, action: A) => {
      const nextState = reducer(state, action);
      setState(nextState);
      return nextState;
    },
    [reducer, setState]
  );

  return useReducer(memoizedReducer, state);
}
