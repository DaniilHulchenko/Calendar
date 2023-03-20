import {
  add,
  endOfWeek,
  formatISO,
  getTime,
  parseISO,
  startOfWeek,
  sub,
} from "date-fns";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WeekBoundsContextValue = {
  startTime: number;
  endTime: number;
  goToNextWeek(): void;
  goToPreviousWeek(): void;
};

const WeekBoundsContext = createContext<WeekBoundsContextValue | undefined>(
  undefined
);

const WeekBoundsProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [startTime, setStartTime] = useState<number>(-1);

  const updateUrl = useCallback(
    async (startDate: Date) => {
      await router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          start: formatISO(startDate, { representation: "date" }),
        },
      });
    },
    [router]
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (typeof router.query.start !== "string") {
      updateUrl(new Date());
      return;
    }

    setStartTime(
      getTime(startOfWeek(parseISO(router.query.start), { weekStartsOn: 1 }))
    );
  }, [router.isReady, router.query.start, updateUrl]);

  const contextValue = useMemo<WeekBoundsContextValue>(
    () => ({
      startTime,
      endTime: getTime(endOfWeek(startTime, { weekStartsOn: 1 })),
      goToNextWeek: () => updateUrl(add(startTime, { weeks: 1 })),
      goToPreviousWeek: () => updateUrl(sub(startTime, { weeks: 1 })),
    }),
    [updateUrl, startTime]
  );

  if (startTime === -1) {
    return null;
  }

  return (
    <WeekBoundsContext.Provider value={contextValue}>
      {children}
    </WeekBoundsContext.Provider>
  );
};

export default WeekBoundsProvider;

export const useWeekBounds = () => {
  const context = useContext(WeekBoundsContext);

  if (context === undefined) {
    throw new Error("useWeekBounds must be used within a WeekBoundsProvider");
  }

  return context;
};
