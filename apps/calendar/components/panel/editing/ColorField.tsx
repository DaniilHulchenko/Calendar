import { Popover, Transition } from "@headlessui/react";
import fontColorContrast from "font-color-contrast";
import { useState } from "react";
import { usePopper } from "react-popper";
import dynamic from "next/dynamic";

const ColorPicker = dynamic(() => import("./ColorPicker"));

const ColorField = ({
  color,
  onChange,
  disabled,
}: {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) => {
  const [reference, setReference] = useState<HTMLButtonElement | null>();
  const [popper, setPopper] = useState<HTMLDivElement | null>();

  const { styles, attributes } = usePopper(reference, popper);

  return (
    <Popover>
      <label className="label-default">Color</label>

      <Popover.Button
        ref={setReference}
        className="mt-1 w-full rounded p-2 shadow"
        disabled={disabled}
        style={{ backgroundColor: color }}
      >
        <div className="text-sm" style={{ color: fontColorContrast(color) }}>
          {color}
        </div>
      </Popover.Button>

      <Popover.Panel
        ref={setPopper}
        style={styles.popper}
        {...attributes.popper}
      >
        <Transition
          enter="transition ease-out duration-800"
          enterFrom="opacity-0 translate-y-4"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-600"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-4"
        >
          <ColorPicker color={color} onChange={onChange} />
        </Transition>
      </Popover.Panel>
    </Popover>
  );
};

export default ColorField;
