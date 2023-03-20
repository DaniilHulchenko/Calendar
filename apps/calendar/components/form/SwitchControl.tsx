import { Switch } from "@headlessui/react";
import classNames from "classnames";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

type SwitchControlProps<TFieldValues> = UseControllerProps<TFieldValues> & {
  className?: string;
  label: string;
};

const SwitchControl = <TFieldValues extends FieldValues>(
  props: SwitchControlProps<TFieldValues>
) => {
  const { label, className, ...rest } = props;
  const controller = useController(rest);

  return (
    <Switch.Group
      as="div"
      className={classNames("flex items-center", className)}
    >
      <Switch.Label className="mr-4 text-sm">{label}</Switch.Label>

      <div className="grow" />

      <Switch
        checked={controller.field.value}
        onChange={controller.field.onChange}
        className={classNames(
          "relative inline-flex h-6 w-11 items-center rounded-full shadow transition",
          controller.field.value ? "bg-indigo-600" : "bg-gray-200"
        )}
      >
        <span
          className={classNames(
            "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out",
            controller.field.value ? "translate-x-6" : "translate-x-1"
          )}
        />
      </Switch>
    </Switch.Group>
  );
};

export default SwitchControl;
