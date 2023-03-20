import { Combobox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import _ from "lodash";
import { Fragment, ReactNode, useEffect, useMemo } from "react";

export function DefaultCombobox<TValue extends unknown>(props: {
  className?: string;
  label: string;
  srLabel?: boolean;
  placeholder?: string;
  children: ReactNode;
  disabled?: boolean;
  onChange: (query: string) => void;
  onSelect: (value: TValue) => void;
}) {
  const updateQuery = useMemo(
    () => _.debounce(props.onChange, 300),
    [props.onChange]
  );

  useEffect(() => {
    return () => {
      updateQuery.cancel();
    };
  }, [updateQuery]);

  return (
    <Combobox
      as="div"
      className={classNames("relative z-10", props.className)}
      value={null}
      onChange={props.onSelect}
      nullable
      disabled={props.disabled}
    >
      <Combobox.Label
        className={classNames("label-default", props.srLabel && "sr-only")}
      >
        {props.label}
      </Combobox.Label>

      {/** @todo add prefix icon/text */}
      <div className={classNames("relative w-full", props.label && "mt-1")}>
        <Combobox.Input
          className="input-default w-full pr-10"
          placeholder={props.placeholder}
          onChange={(event) => updateQuery(event.target.value.trim())}
        />

        <DefaultCombobox.Button className="absolute inset-y-0 right-0" />
      </div>

      <DefaultCombobox.List afterLeave={() => updateQuery("")}>
        {props.children}
      </DefaultCombobox.List>
    </Combobox>
  );
}

DefaultCombobox.Button = function Button({
  className,
}: {
  className?: string;
}) {
  return (
    <Combobox.Button
      className={classNames("flex items-center pr-2", className)}
    >
      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </Combobox.Button>
  );
};

/** @todo Import from headlessui in future. */
type OptionRenderPropArg = {
  active: boolean;
  selected: boolean;
  disabled: boolean;
};

DefaultCombobox.Option = function Option<TValue extends unknown>({
  value,
  className,
  disabled,
  children,
}: {
  children: ReactNode;
  value: TValue;
  disabled?: boolean;
  className?: (arg: OptionRenderPropArg) => string;
}) {
  return (
    <Combobox.Option
      value={value}
      className={(arg) =>
        classNames(
          "select-none py-2 px-4 transition",
          arg.active ? "bg-indigo-500 text-white" : "text-gray-900",
          arg.disabled ? "opacity-50" : "cursor-pointer opacity-100",
          className?.(arg)
        )
      }
      disabled={disabled}
    >
      {children}
    </Combobox.Option>
  );
};

DefaultCombobox.Message = function Message({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <li className="select-none py-2 px-4 text-gray-900 opacity-50">
      {children}
    </li>
  );
};

DefaultCombobox.List = function List({
  afterLeave,
  children,
}: {
  children: ReactNode;
  afterLeave: () => void;
}) {
  return (
    <Transition
      as={Fragment}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
      afterLeave={afterLeave}
    >
      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded border border-gray-200 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
        {children}
      </Combobox.Options>
    </Transition>
  );
};
