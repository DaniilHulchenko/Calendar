import classNames from "classnames";
import { motion } from "framer-motion";
import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";

const Button = (
  {
    className,
    children,
    icon,
    component = "button",
    variant,
    ...restProps
  }: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    icon: ReactNode;
    component?: string;
    variant: "contained" | "outlined";
  },
  ref: ForwardedRef<HTMLElement>
) => {
  return React.createElement(
    component,
    {
      ...restProps,
      ref,
      className: classNames(
        "flex items-center cursor-pointer rounded-lg py-2 px-3",
        "text-sm font-semibold uppercase shadow transition disabled:cursor-default",
        children && "gap-2",
        variant === "contained" &&
          "bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-400",
        variant === "outlined" &&
          "border border-indigo-500/50 bg-white text-indigo-500 hover:border-indigo-500 hover:bg-indigo-500/5 disabled:bg-gray-500/5 disabled:border-gray-400 disabled:text-gray-400",
        className
      ),
    },
    <div className="h-5 w-5">{icon}</div>,
    <div>{children}</div>
  );
};

export default motion(forwardRef(Button));
