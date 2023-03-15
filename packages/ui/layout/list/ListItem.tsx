import { MouseEventHandler, ReactNode } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

const ListItem = ({
  children,
  className,
  selected,
  disabled,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => (
  <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <button
      className={classNames(
        className,
        "flex w-full rounded transition",
        selected && "pointer-events-none bg-indigo-200/50",
        !disabled && "hover:bg-indigo-200/50"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  </motion.li>
);

export default ListItem;
