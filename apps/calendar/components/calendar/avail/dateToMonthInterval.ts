import { endOfMonth, Interval, startOfMonth } from "date-fns";

const dateToMonthInterval = (date: number | Date): Interval => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

export default dateToMonthInterval;
