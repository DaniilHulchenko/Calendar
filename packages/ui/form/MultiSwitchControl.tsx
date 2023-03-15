import { ReactNode } from "react";
import MultiSwitch, { MultiSwitchOption } from "../MultiSwitch";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

type MultiSwitchControlProps<TFieldValues, TValue> =
  UseControllerProps<TFieldValues> & {
    icon?: ReactNode;
    options: MultiSwitchOption<TValue>[];
  };

const MultiSwitchControl = <
  TFieldValues extends FieldValues,
  TValue extends unknown
>({
  icon,
  options,
  ...controllerProps
}: MultiSwitchControlProps<TFieldValues, TValue>) => {
  const controller = useController(controllerProps);

  return (
    <MultiSwitch
      icon={icon}
      value={controller.field.value}
      options={options}
      onClick={controller.field.onChange}
    />
  );
};

export default MultiSwitchControl;
