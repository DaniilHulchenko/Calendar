import classNames from "classnames";
import { format, eachDayOfInterval } from "date-fns";
import WeekdayCell from "components/calendar/header/WeekdayCell";
import { useWeekBounds } from "./WeekBoundsProvider";
import { useAppSelector } from "data/redux/store";

type EventSide = "start" | "end";

interface Event {
  id: string;
  title: string;
  time?: string;
  sides?: EventSide[];
  color: string;
  weekStart?: boolean;
  attendee: string;
}

interface Day {
  id: number;
  events?: Event[];
}

interface Week {
  id: number;
  days: Day[];
}

const weeks: Week[] = [
  {
    id: 1,
    days: [
      { id: 28 },
      { id: 29 },
      { id: 30 },
      {
        id: 1,
        events: [
          {
            id: "0",
            title: "All Day Event",
            color: "bg-red-500",
            sides: ["start", "end"],
            attendee: "2/2",
          },
        ],
      },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ],
  },
  {
    id: 2,
    days: [
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      {
        id: 11,
        events: [
          {
            id: "1",
            title: "Long Event",
            time: "12a",
            color: "bg-orange-500",
            sides: ["start"],
            attendee: "1/2",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    days: [
      {
        id: 12,
        events: [
          {
            id: "1",
            title: "Long Event",
            time: "12a",
            color: "bg-orange-500",
            weekStart: true,
            attendee: "",
          },
        ],
      },
      {
        id: 13,
        events: [
          {
            id: "1",
            title: "Long Event",
            time: "12a",
            color: "bg-orange-500",
            sides: ["end"],
            attendee: "2/7",
          },
        ],
      },
      { id: 14 },
      { id: 15 },
      {
        id: 16,
        events: [
          {
            id: "2",
            title: "Meeting",
            time: "10:30a",
            color: "bg-indigo-500",
            sides: ["start", "end"],
            attendee: "2/2",
          },
          {
            id: "3",
            title: "Lunch",
            time: "12p",
            color: "bg-indigo-500",
            sides: ["start", "end"],
            attendee: "3/4",
          },
        ],
      },
      {
        id: 17,
        events: [
          {
            id: "4",
            title: "Birthday Party",
            time: "7p",
            color: "bg-green-500",
            sides: ["start", "end"],
            attendee: "0/7",
          },
        ],
      },
      { id: 18 },
    ],
  },
  {
    id: 4,
    days: [
      { id: 19 },
      { id: 20 },
      { id: 21 },
      { id: 22 },
      { id: 23 },
      { id: 24 },
      { id: 25 },
    ],
  },
  {
    id: 5,
    days: [
      { id: 26 },
      { id: 27 },
      {
        id: 28,
        events: [
          {
            id: "5",
            title: "Click for Google",
            time: "12a",
            color: "bg-cyan-500",
            sides: ["start", "end"],
            attendee: "1/5",
          },
        ],
      },
      { id: 29 },
      { id: 30 },
      { id: 31 },
      { id: 1 },
    ],
  },
];

const MonthCalendar = () => {
  const slim = useAppSelector((state) => state.ui.slim);
  const rowHeight = slim ? "15px" : "auto";
  const weekBounds = useWeekBounds();

  const weekRange = eachDayOfInterval({
    start: weekBounds.startTime,
    end: weekBounds.endTime,
  });

  return (
    <div className="flex h-full grow flex-col divide-y">
      <div className="flex divide-x">
        {weekRange.map((date) => (
          <WeekdayCell key={date.getDate()} day={format(date, "EEE")} />
        ))}
      </div>

      <div className="flex flex-grow flex-col divide-y">
        {weeks.map(({ id, days }) => (
          <div key={id} className="flex flex-grow flex-row divide-x">
            {days.map(({ id, events }) => (
              <div key={id} className="flex flex-grow basis-1/7 flex-col">
                <div className="flex justify-end p-1">{id}</div>

                {events && (
                  <div className="flex flex-col gap-1">
                    {events.map(
                      ({
                        id,
                        title,
                        time,
                        sides,
                        color,
                        weekStart,
                        attendee,
                      }) => (
                        <div
                          key={id}
                          className={classNames(
                            "p-1 text-white",
                            color || "bg-gray-400",
                            {
                              "rounded-tl rounded-bl": sides?.includes("start"),
                              "rounded-tr rounded-br": sides?.includes("end"),
                            }
                          )}
                        >
                          <div
                            className={classNames("flex h-6 justify-end", {
                              "h-[16px]": slim,
                            })}
                          >
                            {!slim && (
                              <>
                                {sides?.includes("start") && (
                                  <span className="pr-1 font-semibold">
                                    {time}
                                  </span>
                                )}
                                {(sides?.includes("start") || weekStart) && (
                                  <span>{title}</span>
                                )}
                              </>
                            )}
                            <span
                              className={classNames("flex grow justify-end", {
                                "text-xs": slim,
                              })}
                            >
                              {attendee}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthCalendar;
