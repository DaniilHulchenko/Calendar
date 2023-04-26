import classNames from "classnames";
import { ReactNode, useEffect, useState } from "react";

export type CheckBoxhOption<TValue> = {
  label: string;
  value: TValue;
};

type CheckBoxProps<TValue> = {
  icon?: ReactNode;
  value?: TValue;
  options: CheckBoxhOption<TValue>[];
  className?: string;
  onClick(value: any): void;
  onChange(value: boolean): void;
};

const CheckBox = <TValue extends unknown>(props: CheckBoxProps<TValue>) => {
  const [checked, setChecked] = useState<TValue[]>([]);
  useEffect(() => {
    props.onClick(checked);
  }, [checked]);

  return (
    <div className={classNames("flex items-center rounded border border-slate-300 bg-slate-200	", props.className)}>
      {props.icon && <div className="ml-2 mr-1 h-5 w-5 text-gray-900">{props.icon}</div>}
      {props.options.map((option) => (
        <button
          key={option.label}
          className={classNames(
            "m-1 rounded py-1 px-1 text-sm font-semibold uppercase text-gray-900/50 transition hover:bg-white/50 ",
            {
              "bg-white text-black shadow": checked.includes(option.value),
            },
          )}
          onClick={() => {
            setChecked((current: TValue[]) =>
              !current.includes(option.value)
                ? [...checked, option.value]
                : current.filter((value) => value !== option.value),
            );
            props.onChange(true);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default CheckBox;
