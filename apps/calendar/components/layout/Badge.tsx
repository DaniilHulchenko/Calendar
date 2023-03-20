import classNames from "classnames";
import { motion } from "framer-motion";
import { ForwardedRef, forwardRef } from "react";

const Badge = (
  {
    children,
    className,
  }: {
    children: string;
    className?: string;
  },
  ref: ForwardedRef<HTMLDivElement>
) => (
  <div
    ref={ref}
    className={classNames(
      "rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-500",
      className
    )}
    title={children}
  >
    {children}
  </div>
);

export default motion(forwardRef(Badge));
