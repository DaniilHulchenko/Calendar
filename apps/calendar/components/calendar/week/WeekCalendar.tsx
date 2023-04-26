import { PanelProvider } from "../../panel/PanelProvider";
import CurrentWeekColumn from "./CurrentWeekColumn";
import WeekColumnsList from "./WeekColumnsList";

const WeekCalendar = () => (
  <PanelProvider>
    <div className="flex min-h-full">
      <CurrentWeekColumn />
      <WeekColumnsList />
    </div>
  </PanelProvider>
);

export default WeekCalendar;
