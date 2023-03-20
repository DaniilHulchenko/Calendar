import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { Avail } from "supabase/avails.table";
import {
  eachDayOfInterval,
  format,
  getDay,
  Interval,
  isEqual,
  isSameDay,
  isToday,
  max,
  min,
  parseISO,
} from "date-fns";
import { MouseEvent, MouseEventHandler, useCallback, useMemo } from "react";

const colStartClasses = [
  "col-start-7",
  "col-start-1",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
];

const AvailCalendar = ({
  interval,
  selectedDays,
  className,
  isRounded,
  avails,
  isSkeleton,
  onSelectDays,
  onPrevious,
  onNext,
}: {
  className?: string;
  interval: Interval;
  selectedDays?: Date[];
  avails: Avail[] | undefined;
  isSkeleton?: boolean;
  isRounded?: boolean;
  onSelectDays?: (dates: Date[]) => void;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  const days = useMemo(() => eachDayOfInterval(interval), [interval]);

  const handleClick = useCallback(
    (
      event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      day: Date
    ) => {
      if (!selectedDays) {
        throw new Error("Selected dates must be defined");
      }

      if (!event.shiftKey) {
        return onSelectDays?.([day]);
      }

      const notMiddleDays = [...selectedDays, day];

      onSelectDays?.(
        eachDayOfInterval({
          start: min(notMiddleDays),
          end: max(notMiddleDays),
        })
      );
    },
    [onSelectDays, selectedDays]
  );

  return (
    <section className={className}>
      <div className="flex items-center">
        <h2 className="flex-auto font-semibold text-gray-900">
          {format(interval.start, "MMMM yyyy")}
        </h2>

        <button
          type="button"
          onClick={onPrevious}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          onClick={onNext}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className={classNames("mt-4", isRounded && "rounded-lg border")}>
        <div className="grid grid-cols-7 pt-1.5 text-center text-xs leading-6 text-gray-500">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>

        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, index) => (
            <AvailCell
              key={day.toISOString()}
              isFirst={index === 0}
              itsDate={day}
              avails={avails}
              isSkeleton={isSkeleton}
              isDisabled={isSkeleton || !onSelectDays}
              selectedDays={selectedDays || []}
              onClick={(event) => handleClick(event, day)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailCalendar;

function AvailCell({
  isFirst,
  itsDate,
  isSkeleton,
  avails,
  isDisabled,
  selectedDays,
  onClick,
}: {
  isFirst: boolean;
  itsDate: Date;
  isSkeleton: boolean | undefined;
  avails: Avail[] | undefined;
  isDisabled: boolean;
  selectedDays: Date[];
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  const avail = useMemo(
    () => avails?.find(({ date }) => isSameDay(parseISO(date), itsDate)),
    [avails, itsDate]
  );

  const isSelected = useMemo(
    () =>
      selectedDays.some((selectedDay) => isEqual(itsDate, selectedDay)) &&
      !isSkeleton,
    [itsDate, selectedDays, isSkeleton]
  );

  const isBusy = avail?.status === false;

  return (
    <div
      className={classNames(
        "py-1.5",
        isFirst && colStartClasses[getDay(itsDate)]
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={classNames(
          !isDisabled && "hover:ring hover:ring-indigo-300",
          "mx-auto flex h-8 w-8 items-center justify-center rounded-lg transition",
          isToday(itsDate) && "font-bold text-indigo-500",
          isSelected &&
            !isBusy &&
            "bg-indigo-500 font-semibold text-white shadow-md",
          !isSelected &&
            !isBusy &&
            !isDisabled &&
            "hover:font-semibold hover:text-indigo-500",
          isBusy && !isSelected && "bg-red-300 text-white shadow-md",
          isBusy &&
            isSelected &&
            "bg-red-500 font-semibold text-white shadow-md"
        )}
      >
        {isSkeleton ? (
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        ) : (
          <time dateTime={format(itsDate, "yyyy-MM-dd")}>
            {format(itsDate, "d")}
          </time>
        )}
      </button>
    </div>
  );
}
