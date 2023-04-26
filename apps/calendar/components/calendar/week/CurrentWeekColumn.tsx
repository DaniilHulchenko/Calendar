import { getISOWeek } from "date-fns";
import WeekdayCell from "components/calendar/header/WeekdayCell";
import { useWeekBounds } from "../WeekBoundsProvider";

const CurrentWeekColumn = () => {
  const weekBounds = useWeekBounds();

  return (
    <div className="flex flex-col border-r border-gray-200">
      <div className="border-b border-gray-200">
        <WeekdayCell day="CW" />
      </div>

      <div className="flex grow items-center justify-center">
        {getISOWeek(weekBounds.startTime)}
      </div>
    </div>
  );
};

export default CurrentWeekColumn;
