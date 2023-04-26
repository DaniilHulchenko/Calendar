interface WeekdayItemProps {
  day: string;
}

const WeekdayCell = ({ day }: WeekdayItemProps) => (
  <div className="flex basis-1/7 items-center justify-center p-1 uppercase">
    {day}
  </div>
);

export default WeekdayCell;
