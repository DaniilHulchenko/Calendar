import classNames from "classnames";
import { MouseEventHandler, ReactNode } from "react";

const CarouselButton = ({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    className={classNames(
      "absolute top-[calc(50%-20px)] z-10 flex h-10 w-10 items-center",
      "justify-center rounded-full bg-gray-900/10",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default CarouselButton;
