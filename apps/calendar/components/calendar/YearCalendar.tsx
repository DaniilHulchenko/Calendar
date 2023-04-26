import { Fragment, useContext } from "react";
import { useAppSelector } from "data/redux/store";
import { CellContext } from "components/auth/CellProvider";

const days: number[] = Array.from(Array(31).keys()).map((v) => v + 1);

interface Event {
  startDay: number;
  name: string;
  trainer: string;
  attendee: string;
  length: number;
  color: string;
}

interface Month {
  name: string;
  events: Event[];
}

const red = "dc2626";
const green = "16a34a";
const amber = "d97706";
const orange = "ea580c";
const indigo = "4F46E5";
const yellow = "ca8a04";
const pink = "db2777";

const months: Month[] = [
  {
    name: "Jan",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 7,
        color: red,
      },
      {
        startDay: 20,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 1,
        color: green,
      },
      {
        startDay: 21,
        name: "Diamond In Logic",
        trainer: "Yadira Wallace",
        attendee: "1/2",
        length: 1,
        color: amber,
      },
      {
        startDay: 24,
        name: "Amalgamated Scenarios",
        trainer: "Garrett Mcknight",
        attendee: "10/11",
        length: 5,
        color: orange,
      },
      {
        startDay: 24,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 1,
        color: green,
      },
      {
        startDay: 26,
        name: "Beyond Red Events",
        trainer: "Brody Rowe",
        attendee: "2/8",
        length: 2,
        color: green,
      },
      {
        startDay: 28,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 1,
        color: green,
      },
    ],
  },
  {
    name: "Feb",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 2,
        color: red,
      },
      {
        startDay: 1,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 1,
        color: indigo,
      },
      {
        startDay: 12,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 2,
        color: green,
      },
      {
        startDay: 18,
        name: "Diamond In Logic",
        trainer: "Yadira Wallace",
        attendee: "1/2",
        length: 1,
        color: yellow,
      },
      {
        startDay: 21,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 24,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 5,
        color: red,
      },
    ],
  },
  {
    name: "Mar",
    events: [
      {
        startDay: 7,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 6,
        color: red,
      },
      {
        startDay: 15,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 3,
        color: indigo,
      },
      {
        startDay: 21,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 21,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 1,
        color: green,
      },
      {
        startDay: 28,
        name: "Oui Lucky Day",
        trainer: "Aliyah Vega",
        attendee: "2/3",
        length: 4,
        color: indigo,
      },
    ],
  },
  {
    name: "Apr",
    events: [
      {
        startDay: 1,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 1,
        color: indigo,
      },
      {
        startDay: 4,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 4,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 5,
        color: red,
      },
      {
        startDay: 9,
        name: "Amalgamated Scenarios",
        trainer: "Garrett Mcknight",
        attendee: "10/11",
        length: 8,
        color: orange,
      },
      {
        startDay: 9,
        name: "Fourplan Mania",
        trainer: "Jordan Lang",
        attendee: "10/11",
        length: 7,
        color: orange,
      },
      {
        startDay: 8,
        name: "Lucky Delight",
        trainer: "Jadyn Richardson",
        attendee: "10/11",
        length: 8,
        color: orange,
      },
      {
        startDay: 11,
        name: "Oui Lucky Day",
        trainer: "Aliyah Vega",
        attendee: "2/3",
        length: 4,
        color: indigo,
      },
      {
        startDay: 19,
        name: "Jade Moments",
        trainer: "Rey Jennings",
        attendee: "2/9",
        length: 2,
        color: indigo,
      },
      {
        startDay: 23,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 8,
        color: red,
      },
      {
        startDay: 25,
        name: "Simply Jumping Delight",
        trainer: "Marquis Kidd",
        attendee: "2/9",
        length: 3,
        color: indigo,
      },
      {
        startDay: 30,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 2,
        color: green,
      },
    ],
  },
  {
    name: "May",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 2,
        color: red,
      },
      {
        startDay: 2,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 4,
        color: indigo,
      },
      {
        startDay: 2,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 5,
        color: red,
      },
      {
        startDay: 6,
        name: "Five Live Mountain",
        trainer: "Cornelius Roberts",
        attendee: "26/38",
        length: 3,
        color: red,
      },
      {
        startDay: 9,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 4,
        color: indigo,
      },
      {
        startDay: 16,
        name: "Oui Lucky Day",
        trainer: "Aliyah Vega",
        attendee: "2/3",
        length: 4,
        color: indigo,
      },
      {
        startDay: 9,
        name: "Oh How Running Services",
        trainer: "Allison Silva",
        attendee: "2/3",
        length: 12,
        color: pink,
      },
      {
        startDay: 26,
        name: "Jade Concourse Creations",
        trainer: "Cornelius Roberts",
        attendee: "26/38",
        length: 4,
        color: red,
      },
      {
        startDay: 27,
        name: "Superb Specacular Planning",
        trainer: "Semaj Rodriguez",
        attendee: "26/38",
        length: 1,
        color: red,
      },
      {
        startDay: 27,
        name: "Satori Couture Sweet",
        trainer: "Semaj Rodriguez",
        attendee: "26/38",
        length: 1,
        color: red,
      },
      {
        startDay: 27,
        name: "Smart Celebration",
        trainer: "Semaj Rodriguez",
        attendee: "26/38",
        length: 1,
        color: red,
      },
      {
        startDay: 27,
        name: "Roads Planet",
        trainer: "Semaj Rodriguez",
        attendee: "26/38",
        length: 1,
        color: red,
      },
      {
        startDay: 30,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 2,
        color: green,
      },
    ],
  },
  {
    name: "Jun",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 4,
        color: red,
      },
      {
        startDay: 1,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 2,
        color: green,
      },
      {
        startDay: 7,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 5,
        color: red,
      },
      {
        startDay: 13,
        name: "Five Live Mountain",
        trainer: "Cornelius Roberts",
        attendee: "26/38",
        length: 7,
        color: red,
      },
      {
        startDay: 27,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 4,
        color: indigo,
      },
    ],
  },
  {
    name: "Jul",
    events: [
      {
        startDay: 2,
        name: "Amalgamated Scenarios",
        trainer: "Garrett Mcknight",
        attendee: "10/11",
        length: 8,
        color: orange,
      },
      {
        startDay: 3,
        name: "Fourplan Mania",
        trainer: "Jordan Lang",
        attendee: "10/11",
        length: 14,
        color: orange,
      },
      {
        startDay: 4,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 12,
        color: red,
      },
      {
        startDay: 18,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 5,
        color: red,
      },
      {
        startDay: 22,
        name: "Lucky Delight",
        trainer: "Jadyn Richardson",
        attendee: "10/11",
        length: 8,
        color: orange,
      },
    ],
  },
  {
    name: "Aug",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 12,
        color: red,
      },
      {
        startDay: 1,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 5,
        color: indigo,
      },
      {
        startDay: 1,
        name: "Amalgamated Scenarios",
        trainer: "Garrett Mcknight",
        attendee: "10/11",
        length: 6,
        color: orange,
      },
      {
        startDay: 8,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 14,
        name: "Lucky Delight",
        trainer: "Jadyn Richardson",
        attendee: "10/11",
        length: 8,
        color: orange,
      },
      {
        startDay: 22,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 10,
        color: red,
      },
    ],
  },
  {
    name: "Sep",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 4,
        color: red,
      },
      {
        startDay: 3,
        name: "Amalgamated Scenarios",
        trainer: "Garrett Mcknight",
        attendee: "10/11",
        length: 2,
        color: orange,
      },
      {
        startDay: 8,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 3,
        color: green,
      },
      {
        startDay: 9,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 2,
        color: green,
      },
      {
        startDay: 13,
        name: "Beyond Red Events",
        trainer: "Brody Rowe",
        attendee: "2/8",
        length: 5,
        color: green,
      },
    ],
  },
  {
    name: "Oct",
    events: [
      {
        startDay: 10,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 5,
        color: indigo,
      },
      {
        startDay: 10,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 5,
        color: red,
      },
      {
        startDay: 16,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 8,
        color: red,
      },
      {
        startDay: 16,
        name: "Five Live Mountain",
        trainer: "Cornelius Roberts",
        attendee: "26/38",
        length: 8,
        color: red,
      },
      {
        startDay: 17,
        name: "Oui Lucky Day",
        trainer: "Aliyah Vega",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
    ],
  },
  {
    name: "Nov",
    events: [
      {
        startDay: 1,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 2,
        color: red,
      },
      {
        startDay: 1,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 1,
        color: indigo,
      },
      {
        startDay: 12,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 2,
        color: green,
      },
      {
        startDay: 18,
        name: "Diamond In Logic",
        trainer: "Yadira Wallace",
        attendee: "1/2",
        length: 1,
        color: yellow,
      },
      {
        startDay: 21,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 24,
        name: "Dreams Supreme",
        trainer: "Oliver Vazquez",
        attendee: "26/38",
        length: 5,
        color: red,
      },
    ],
  },
  {
    name: "Dec",
    events: [
      {
        startDay: 7,
        name: "Pomp Success Shows",
        trainer: "Emerson Knapp",
        attendee: "2/2",
        length: 6,
        color: red,
      },
      {
        startDay: 15,
        name: "Fourplan Moment",
        trainer: "Miah Jarvis",
        attendee: "1/5",
        length: 3,
        color: indigo,
      },
      {
        startDay: 21,
        name: "Little Happen",
        trainer: "Haven Lin",
        attendee: "2/3",
        length: 5,
        color: indigo,
      },
      {
        startDay: 21,
        name: "Evermore Science",
        trainer: "Shyanne Knight",
        attendee: "4/17",
        length: 1,
        color: green,
      },
      {
        startDay: 28,
        name: "Oui Lucky Day",
        trainer: "Aliyah Vega",
        attendee: "2/3",
        length: 4,
        color: indigo,
      },
    ],
  },
];

const YearCalendar = () => {
  const cellContext = useContext(CellContext);
  const slim = cellContext.slim;
  const rowHeight = slim ? 8 : 24;

  return (
    <div className="grid h-full grow grid-cols-[auto_repeat(31,_minmax(0,_1fr))_auto] grid-rows-[auto_repeat(12,_minmax(0,_auto))] gap-px bg-gray-300">
      <div className="flex items-center justify-center bg-gray-50 p-1">
        2022
      </div>

      {days.map((day) => (
        <div
          key={day}
          className="flex items-center justify-center bg-gray-50 p-1"
        >
          {day}
        </div>
      ))}

      <div className="flex items-center justify-center bg-gray-50 p-1">
        2022
      </div>

      {months.map(({ name, events }) => (
        <Fragment key={name}>
          <div className="flex items-center justify-center bg-gray-50 p-1">
            {name}
          </div>

          {days.map((day) => {
            const dayEvents = events
              .filter(({ startDay }) => startDay === day)
              .map((event) => ({
                event,
                overlapCount: getFrontOverlaps(
                  event.name,
                  event.startDay,
                  events
                ).length,
              }));

            const maxOverlapCount =
              dayEvents.length > 0
                ? Math.max(...dayEvents.map(({ overlapCount }) => overlapCount))
                : 0;

            return (
              <div
                key={day}
                className="relative bg-gray-50"
                style={{
                  minHeight:
                    dayEvents.length > 0
                      ? `${(dayEvents.length + maxOverlapCount) * rowHeight}px`
                      : undefined,
                }}
              >
                {dayEvents.map(({ event, overlapCount }, index) => {
                  const { name, trainer, attendee, length, color } = event;
                  const title = `${name} / ${trainer}`;

                  return (
                    <div
                      key={name}
                      className="absolute z-10 flex justify-between gap-1 rounded p-1 text-xs text-white"
                      style={{
                        top: `${
                          index * rowHeight + overlapCount * rowHeight
                        }px`,
                        width: `calc(${length}00% + ${length - 1}px)`,
                        backgroundColor: `#${color}`,
                      }}
                      title={title}
                    >
                      {!slim && (
                        <Fragment>
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                            {title}
                          </span>
                          <span>{attendee}</span>
                        </Fragment>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="flex items-center justify-center bg-gray-50 p-1">
            {name}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

function getFrontOverlaps(
  name: string,
  startDay: number,
  otherEvents: Event[]
): Event[] {
  const overlaps: Event[] = [];

  for (const otherEvent of otherEvents) {
    if (otherEvent.name === name) {
      break;
    }

    if (
      startDay > otherEvent.startDay &&
      startDay < otherEvent.startDay + otherEvent.length
    ) {
      overlaps.push(otherEvent);
    }
  }

  return overlaps;
}

export default YearCalendar;
