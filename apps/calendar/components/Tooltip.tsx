import classNames from "classnames";
import { ReactNode } from "react";

const Tooltip = ({
  jump,
  children,
}: {
  children: ReactNode;
  jump: boolean;
}) => (
  <div
    className={classNames(
      "mb-1 rounded border border-gray-200 bg-white p-1",
      "text-gray-900 shadow-md transition",
      !jump && "group-hover:-translate-y-1",
      jump && "group-hover:-translate-y-2"
    )}
  >
    {children}
  </div>
);

export default Tooltip;
