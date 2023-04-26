import { useCallback, useEffect, useRef, useState } from "react";

export const useTimeout = (delay: number) => {
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>();
  const [checkHover, setCheckHover] = useState(false);

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => setCheckHover(true), delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setCheckHover(false);
  }, []);

  useEffect(() => clear);
  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { reset, clear, set, stillHover: checkHover };
};
