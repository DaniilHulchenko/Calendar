import MonthCalendar from "components/calendar/MonthCalendar";
import WeekBoundsProvider from "components/calendar/WeekBoundsProvider";
import CalendarLayout from "components/layout/CalendarLayout";
import { useTranslation } from "components/translation";
import Head from "next/head";

const MonthCalendarPage = () => {
  const t = useTranslation();

  return (
    <WeekBoundsProvider>
      <CalendarLayout>
        <Head>
          <title>{`${t("Shift plan")} - Month`}</title>
        </Head>
        <MonthCalendar />
      </CalendarLayout>
    </WeekBoundsProvider>
  );
};

export default MonthCalendarPage;
