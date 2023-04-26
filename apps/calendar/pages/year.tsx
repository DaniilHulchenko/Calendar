import WeekBoundsProvider from "components/calendar/WeekBoundsProvider";
import YearCalendar from "components/calendar/YearCalendar";
import CalendarLayout from "components/layout/CalendarLayout";
import { useTranslation } from "components/translation";
import Head from "next/head";

const YearCalendarPage = () => {
  const t = useTranslation();

  return (
    <WeekBoundsProvider>
      <CalendarLayout>
        <Head>
          <title>{`${t("Shift plan")} - Year`}</title>
        </Head>
        <YearCalendar />
      </CalendarLayout>
    </WeekBoundsProvider>
  );
};

export default YearCalendarPage;
