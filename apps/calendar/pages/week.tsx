import WeekCalendar from "components/calendar/week/WeekCalendar";
import WeekBoundsProvider from "components/calendar/WeekBoundsProvider";
import CalendarLayout from "components/layout/CalendarLayout";
import { useTranslation } from "components/translation";
import Head from "next/head";

const WeekCalendarPage = () => {
  const t = useTranslation();

  return (
    <WeekBoundsProvider>
      <CalendarLayout>
        <Head>
          <title>{`${t("Shift plan")} - Week`}</title>
        </Head>
        <WeekCalendar />
      </CalendarLayout>
    </WeekBoundsProvider>
  );
};

export default WeekCalendarPage;
