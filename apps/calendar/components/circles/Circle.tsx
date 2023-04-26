import classNames from "classnames";
import Tooltip from "components/Tooltip";
import React, { MouseEventHandler, ReactNode, useState } from "react";
import { usePopper } from "react-popper";

const Circle = ({
  children,
  className,
  backgroundColor,
  tooltip,
  skeleton,
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  backgroundColor?: string;
  tooltip?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  skeleton?: boolean;
}) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top",
  });

  if (skeleton) {
    return (
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
    );
  }

  return (
    <div
      className={classNames("group rounded-full transition", {
        "hover:shadow-md": !!onClick,
      })}
    >
      <button
        className={classNames(
          "h-6 w-6 rounded-full border border-white text-xs font-semibold text-white transition",
          "flex shrink-0 items-center justify-center ring-4" +
            ` ${backgroundColor}`,
          className,
          {
            "hover:z-10 hover:-translate-y-1": !!onClick,
            "cursor-default": !onClick,
          }
        )}
        style={{ backgroundColor: backgroundColor }}
        ref={setReferenceElement}
        onClick={onClick}
      >
        {children}
      </button>

      <div
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="invisible opacity-0 group-hover:visible group-hover:z-10 group-hover:opacity-100"
      >
        {tooltip && <Tooltip jump={!!onClick}>{tooltip}</Tooltip>}
      </div>
    </div>
  );
};

export default Circle;
