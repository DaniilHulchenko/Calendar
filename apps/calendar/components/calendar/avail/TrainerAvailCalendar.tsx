import { selectAvailsByInterval } from "supabase/avails.table";
import { add } from "date-fns";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AvailCalendar from "./AvailCalendar";
import dateToMonthInterval from "./dateToMonthInterval";

const TrainerAvailCalendar = ({
  monthDate,
  trainerId,
  className,
  paper,
  selectedDays,
  onSelectDays,
}: {
  className?: string;
  monthDate: number | Date;
  trainerId: string;
  paper?: boolean;
  selectedDays?: Date[];
  onSelectDays?: (days: Date[]) => void;
}) => {
  const [interval, setInterval] = useState(() =>
    dateToMonthInterval(monthDate)
  );

  const changeMonth = (months: number) =>
    setInterval(dateToMonthInterval(add(interval.start, { months })));

  const availsQuery = useQuery({
    queryKey: ["avails", trainerId, interval],
    queryFn: () => selectAvailsByInterval(trainerId, interval),
  });

  return (
    <AvailCalendar
      className={className}
      interval={interval}
      avails={availsQuery.data}
      isSkeleton={availsQuery.isLoading}
      isRounded={paper}
      selectedDays={selectedDays}
      onSelectDays={onSelectDays}
      onPrevious={() => changeMonth(-1)}
      onNext={() => changeMonth(1)}
    />
  );
};

export default TrainerAvailCalendar;
