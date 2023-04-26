import classNames from "classnames";
import ProfileAvatar from "components/layout/ProfileAvatar";
import { ReactNode } from "react";
import TrainersListItem from "./TrainersListItem";

const TrainersList = ({
  skeleton,
  children,
  className,
}: {
  skeleton?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <ul className={classNames("space-y-3 overflow-y-auto p-6", className)}>
    {skeleton &&
      Array.from(Array(3).keys()).map((i) => (
        <TrainersListItem
          key={i}
          circle={<ProfileAvatar skeleton small />}
          title={<div className="h-4 animate-pulse rounded bg-gray-200" />}
          description={
            <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          }
        />
      ))}

    {children}
  </ul>
);

export default TrainersList;
