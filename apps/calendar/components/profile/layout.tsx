import classNames from "classnames";
import { motion } from "framer-motion";
import { Children, ReactNode } from "react";

export function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  if (Children.count(children) > 1) {
    throw new Error("ProfileSection can only have one child");
  }

  return (
    <section className="flex flex-wrap py-6  lg:flex-nowrap">
      <div className="mb-2 w-1/3 shrink-0 grow pr-6 sm:mb-0">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

export function DashedContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={classNames(
        "flex h-full items-center justify-center rounded-lg border border-dashed transition",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownBox(props: {
  className?: string;
  dropdown: ReactNode;
  children: ReactNode;
  dashed?: boolean;
}) {
  return (
    <div className={classNames("space-y-3", props.className)}>
      {props.dropdown}

      <motion.div
        className={classNames(
          "flex h-64 flex-wrap content-start items-start gap-2 overflow-auto rounded-lg border p-2",
          props.dashed && "border-dashed"
        )}
      >
        {props.children}
      </motion.div>
    </div>
  );
}
