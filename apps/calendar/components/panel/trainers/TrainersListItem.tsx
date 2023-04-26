import { ReactNode } from "react";

const TrainersListItem = ({
  circle,
  title,
  description,
}: {
  circle: ReactNode;
  title: ReactNode;
  description: ReactNode;
}) => (
  <li className="flex gap-3">
    <div className="p-1">{circle}</div>

    <div className="grow">
      <h3>{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </li>
);

export default TrainersListItem;
