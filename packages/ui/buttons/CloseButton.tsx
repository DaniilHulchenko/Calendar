import { ForwardedRef, forwardRef, MouseEventHandler } from "react";
import { XIcon } from "@heroicons/react/outline";

type CloseButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

const CloseButton = (
  props: CloseButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) => (
  <button
    ref={ref}
    onClick={props.onClick}
    className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-indigo-500 hover:text-white"
  >
    <XIcon className="h-6 w-6" />
  </button>
);

export default forwardRef(CloseButton);
