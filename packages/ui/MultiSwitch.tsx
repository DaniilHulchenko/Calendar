import classNames from "classnames";
import { ReactNode } from "react";

export type MultiSwitchOption<TValue> = {
  label: string;
  value: TValue;
};

type MultiSwitchProps<TValue> = {
  icon?: ReactNode;
  value: TValue;
  options: MultiSwitchOption<TValue>[];
  className?: string;
  onClick(value: TValue): void;
};

const MultiSwitch = <TValue extends unknown>(
  props: MultiSwitchProps<TValue>
) => (
  <div
    className={classNames(
      "flex items-center rounded border border-gray-200 bg-gray-100",
      props.className
    )}
  >
    {props.icon && (
      <div className="ml-2 mr-1 h-5 w-5 text-gray-900">{props.icon}</div>
    )}

    {props.options.map((option) => (
      <button
        key={option.label}
        className="m-1 rounded py-1 px-2 text-sm font-semibold uppercase text-gray-900/50 transition hover:bg-white/50 disabled:bg-white disabled:text-gray-900 disabled:shadow"
        disabled={props.value === option.value}
        onClick={() => props.onClick(option.value)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default MultiSwitch;
