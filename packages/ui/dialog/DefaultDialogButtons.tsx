import classNames from "classnames";
import { ReactNode } from "react";

const DefaultDialogButtons = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={classNames("bg-gray-100 px-6 py-4", className)}>
    {children}
  </div>
);

export default DefaultDialogButtons;
