import { useEffect, useReducer, useRef } from 'react';

const useReducerWithCallback = (reducer, initialState, initializer) => {
  const callbackRef = useRef();
  const [state, dispatch] = useReducer(reducer, initialState, initializer);

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state);
      callbackRef.current = null;
    }
  }, [state]);

  const customDispatch = (action, callback) => {
    callbackRef.current = callback;
    dispatch(action);
  };

  return [state, customDispatch];
};

export default useReducerWithCallback;
